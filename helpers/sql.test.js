const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");
const { SECRET_KEY } = require("../config");

describe("sqlForPartialUpdate", function () {
    test("error handling works", function () {
      try {
        const { setCols, values } = sqlForPartialUpdate(
          {},
          {
            firstName: "first_name",
            lastName: "last_name",
            isAdmin: "is_admin",
          });
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });

    test("works", function () {
      const { setCols, values } = sqlForPartialUpdate(
        {firstName: 'Aliya', age: 32},
        {
          firstName: "first_name"
        });
      expect(setCols).toEqual('"first_name"=$1, "age"=$2');  
      expect(values).toEqual(['Aliya', 32]);
    });
});