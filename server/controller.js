require("dotenv").config();

const userId = 4;

const Sequelize = require("sequelize");
const { CONNECTION_STRING } = process.env;
const db = new Sequelize(CONNECTION_STRING);

let nextEmp = 5;

module.exports = {
  getUpcomingAppointments: (req, res) => {
    db.query(
      `select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`
    )
      .then((dbRes) => res.status(200).send(dbRes[0]))
      .catch((err) => console.log(err));
  },

  approveAppointment: (req, res) => {
    let { apptId } = req.body;

    db.query(`
        UPDATE cc_appointments
        SET approved = true
        WHERE appt_id = ${apptId};
        
        INSERT into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `
    )
      .then((dbRes) => {
        res.status(200).send(dbRes[0]);
        nextEmp += 2;
      })
      .catch((err) => console.log(err));
  },

  completeAppointment: (req, res) => {
    let { apptId } = req.body;
    db.query(`
        UPDATE cc_appointments
        SET completed = true
        WHERE appt_id = ${apptId}
    `)
    .then((dbRes) => {
        res.status(200).send(dbRes[0])
    })
    .catch((err) => {
        console.error(err)
    })
  },

  getAllClients: (req, res) => {
    db.query(
      `
            SELECT * FROM cc_users AS u
            JOIN cc_clients AS c
            ON u.user_id = c.user_id
            WHERE u.user_id = ${userId};
        `
    )
      .then((dbRes) => {
        res.status(200).send(dbRes[0]);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getPendingAppointments: (req, res) => {
    db.query(
      `
            SELECT * FROM cc_appointments
            WHERE approved = false
            ORDER BY date DESC;
        `
    )
      .then((dbRes) => {
        res.status(200).send(dbRes[0]);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getPastAppointments: (req, res) => {
    db.query(
      `
            SELECT appt_id, date, service_type, notes, first_name, last_name FROM cc_appointments, cc_users
            WHERE approved = true AND completed = true
            ORDER BY date DESC;
        `
    )
      .then((dbRes) => {
        res.status(200).send(dbRes[0]);
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
