// Take an incident, find the CI and check if there are active incidents of a certain kind on the parent CI, then add the original incident and add as child to the parent incident.

var inc = "INC0074063";
var gr = new GlideRecord("incident");
gr.addQuery("number",inc);
gr.query();
gr.next();
gr.cmdb_ci.sys_id
//var circuit = new GlideRecord("cmdb_ci_circuit");
//circuit.addQuery("sys_id", gr.cmdb_ci.sys_id);
//circuit.query();
//circuit.next();
//circuit
var parent = new GlideRecord("cmdb_rel_ci");
parent.addQuery("child", gr.cmdb_ci.sys_id);
parent.query();
parent.next();
parent.parent.sys_id;
var parent_inc = new GlideRecord("incident");
parent_inc.addQuery("cmdb_ci", parent.parent.sys_id);
parent_inc.addQuery("state", "!=", 7);
parent_inc.addQuery("description", "CONTAINS", "NE O&M CONNECTION FAILURE")
parent_inc.query();
parent_inc.next();
gr.parent_incident = parent_inc.sys_id;
gr.work_notes = parent_inc.short_description;
gr.update();
gr
