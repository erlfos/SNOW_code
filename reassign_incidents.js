var gr = new GlideRecord("u_cmdb_ci_enodeb");

//gr.addQuery("number","INC0032257");
// Find all enodebs in state "Pending install"
gr.addQuery("install_status","4")
gr.query();
//gr.getRowCount();
gs.addInfoMessage("Records in enodeb table: " + gr.getRowCount());
while (gr.next()) {
  var inc = new GlideRecord("incident");
  // Find all active incidents on the enodebs found above
  inc.addQuery("cmdb_ci", gr.sys_id);
  inc.addQuery("active","false")
  inc.query();
  if (inc.getRowCount()>0) {
    gs.addInfoMessage('CI ' + gr.name + ' has ' + inc.getRowCount() + ' active incidents');
  }

  while (inc.next()) {
    // Assigne each incident to the correct group
    gs.addInfoMessage(inc.number + ' exists with CI ' + inc.cmdb_ci.name);
    // add the sys_id of the correct assignement group below
    //inc.assignment_group = "bc77ac36db5b7f00a161d29c6896198a";
    //inc.update();
  }
  //inc.next();

}
