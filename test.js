let tablecname = "get_records_info_source";

if (tablecname.endsWith("_source")) {
  tablecname = tablecname.slice(0, tablecname.lastIndexOf("_source"));
}
console.log(tablecname);
