"use strict";

const { max } = require("pg/lib/defaults");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for jobs. */

class Job {
    /** Create a job to insert into the database.
       *
       * Returns: {id, title, salary, equity, company_handle}
       * 
       * Throws BadRequestError if company_handle is not valid.
       **/
    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title,
                               salary,
                               equity,
                               company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
          [
            data.title,
            data.salary,
            data.equity,
            data.companyHandle,
          ]);
      let job = result.rows[0];
  
      return job;
    }

    /** Returns all jobs.
       *
       **/
    static async findAll(searchFilters = {}) {
        let queryStr = `SELECT j.id,
                               j.title,
                               j.salary,
                               j.equity,
                               j.company_handle AS "companyHandle",
                               c.name AS "companyName"
                        FROM jobs j 
                        LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let filterStrings = [];
        let filterValues = [];

        const { minSalary, hasEquity, title } = searchFilters;

        if (minSalary !== undefined) {
            filterValues.push(minSalary);
            filterStrings.push(`salary >= $${filterValues.length}`);
        }

        if (hasEquity === true) {
            filterStrings.push(`equity > 0`);
        }

        if (title !== undefined) {
            filterValues.push(`%${title}%`);
            filterStrings.push(`title ILIKE $${filterValues.length}`);
        }

        if (filterStrings.length > 0) {
            queryStr += " WHERE " + filterStrings.join(" AND ");
        }

        queryStr += " ORDER BY title";
        const jobsRes = await db.query(queryStr, filterValues);
        return jobsRes.rows;
    }

    /** Returns a job from a given id.
       *
       * {id, title, salary, equity, company_handle}
       * 
       * Throws NotFoundError if job not found.
       **/
    static async get(id) {
        const jobRes = await db.query(
              `SELECT id,
                      title,
                      salary,
                      equity,
                      company_handle AS "companyHandle"
               FROM jobs
               WHERE id = $1`,
            [id]);
    
        const job = jobRes.rows[0];
    
        if (!job) throw new NotFoundError(`No job: ${id}`);

        const companiesRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
             FROM companies
             WHERE handle = $1`, [job.companyHandle]);
  
        delete job.companyHandle;
        job.company = companiesRes.rows[0];
    
        return job;
    }

    /** Update given job from database with "data". A "partial-update" that can perform even if 
     *  some fields are missing.
     * 
     *  Data can contain: {title, salary, equity}
     * 
     *  Returns: {id, title, salary, equity, company_handle}
     *
     * Throws NotFoundError if job not found.
       **/
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
              companyHandle: "company_handle",
            });
        const IdVarIdx = "$" + (values.length + 1);
    
        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${IdVarIdx} 
                          RETURNING id, 
                                    title, 
                                    salary,
                                    equity,
                                    company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job: ${id}`);
    
        return job;
    }
    
    /** Delete given job from database; returns undefined.
       *
       * Throws NotFoundError if job not found.
       **/
    
    static async remove(id) {
        const result = await db.query(
              `DELETE
               FROM jobs
               WHERE id = $1
               RETURNING id`,
            [id]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;