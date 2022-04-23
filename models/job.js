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
    static async create({ title, salary, equity, company_handle}) {
        const handleCheck = await db.query(
              `SELECT handle
               FROM companies
               WHERE handle = $1`,
            [company_handle]);
    
        if (!handleCheck.rows[0])
          throw new BadRequestError(`Invalid company: ${company_handle}`);
    
        const result = await db.query(
              `INSERT INTO jobs
               (title, salary, equity, company_handle)
               VALUES ($1, $2, $3, $4)
               RETURNING title, salary, equity, company_handle AS "companyHandle"`,
            [
              title,
              salary,
              equity,
              company_handle,
            ],
        );
        const job = result.rows[0];
    
        return job;
    }

    /** Returns all jobs.
       *
       **/
    static async findAll() {
        const jobRes = await db.query(
              `SELECT id, 
                      title,
                      salary, 
                      equity,
                      company_handle AS "companyHandle"
               FROM jobs
               ORDER BY id`);
        return companiesRes.rows;
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