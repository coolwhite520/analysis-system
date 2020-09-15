import location from "./Location";
import cases from "./Cases";

(async () => {
  // await cases.DropCaseByID(1);
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
})();
