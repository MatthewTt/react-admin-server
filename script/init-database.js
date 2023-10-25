const mysql = require('mysql2/promise');
let count = 0;

async function connect() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_DATABASE || 'react-admin';

  const connection = await mysql.createConnection({
    host,
    user,
    password,
  });

  await connection.connect().catch(err => {
    console.log(`host: ${host}`);
    console.log(`user: ${user}`);
    console.log(`password: ${password}`);
    console.log('数据库链接失败，正在重试...');
    console.log(err);
    setTimeout(() => {
      if (count >= 60) {
        console.log('数据库链接失败，重试超过60次，退出程序');
        return;
      }

      connect();
      count++;
    }, 1000);
  });

  console.log('数据库链接成功');
  const [rows] = await connection.query(
    `SELECT * FROM information_schema.SCHEMATA where SCHEMA_NAME = '${database}'`
  );

  if (rows.length === 0) {
    console.log(`数据库${database}不存在，正在创建...`);
    await connection.query(`CREATE DATABASE \`${database}\``);
    console.log(`数据库${database}创建成功`);
  } else {
    console.log(`数据库${database}已存在`);
    process.exit();
  }

  await connection.end();
  /*await connection.connect(async err => {
    if (err) {
      console.log(`host: ${host}`);
      console.log(`user: ${user}`);
      console.log(`password: ${password}`);
      console.log('数据库链接失败，正在重试...');
      console.log(err);

      setTimeout(() => {
        if (count >= 60) {
          console.log('数据库链接失败，重试超过60次，退出程序');
          return;
        }

        connect();
        count++;
      }, 1000);
      return;
    }
    console.log('数据库链接成功');

    await connection.query(
      `SELECT * FROM information_schema.SCHEMATA where SCHEMA_NAME = '${database}'`,
      (err, result) => {
        if (err) {
          console.log(err);
          return;
        }

        if (result.length === 0) {
          console.log(`数据库${database}不存在，正在创建...`);
          connection.query(`CREATE DATABASE \`${database}\``, err => {
            if (err) {
              console.log(err);
              return;
            }
            console.log(`数据库${database}创建成功`);
            process.exit();
          });
        } else {
          process.exit();
        }
      }
    );
    await connection.end();
  });*/
}

connect();
