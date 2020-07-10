const db = require("./DataBase");
const location = require("./Location")(db);
const cases = require("./Cases")(db);
const schema = require("./Schema")(db);

(async () => {
  // await schema.DropSchema("icap_1");
  await cases.CreateNewCase(
    "11111",
    "22222",
    "1034",
    "隐瞒军情案",
    "10",
    "受理",
    "2020-06-12 13:39:48",
    "2020-06-12 13:39:48",
    "2020-06-12 13:39:48",
    "220101",
    "吉林省长春市市辖区",
    "000000",
    "99999999",
    "00000000",
    0,
    1,
    1
  );

  let row = await schema.SwitchSchema("icap_base");
  console.log(row);
  let res = await location.QueryProvince();
  console.log(res);
  // let citys = await location.QueryCityByProvinceID(res[5].id);
  // console.log(citys);
  // let states = await cases.QueryCaseState();
  // console.log(states);
  // res = await schema.CreateNewSchema(1000, "baiyang");
  // console.log(res);
})();
