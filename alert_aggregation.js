var gr = new GlideAggregate("em_alert");
var alerts = new GlideRecord("em_alert");
gr.addAggregate("COUNT","type.name");
gr.addQuery("source","Netact");
gr.addQuery("sys_created_on",'>=', gs.minutesAgo(60));
gr.addQuery("state","IN", "Open,Reopen,Flapping");
gr.addNullQuery("task");
gr.groupBy("type.name");
gr.groupBy("description");
gr.query();
var alertType;
inputs = {};
while (gr.next()) {
  gs.addInfoMessage("Type: " + gr.getDisplayValue("type.name") + "," + gr.getDisplayValue("description") + "," + gr.getAggregate("COUNT","type.name"));
  if (gr.getAggregate("COUNT","type.name") > 50) {
    alertType = gr.getDisplayValue("type.name");
    alertDescription = gr.getDisplayValue("description");
    alerts.addQuery("source","Netact");
    alerts.addQuery("type.name",alertType);
    alerts.addQuery("sys_created_on",'>=', gs.minutesAgo(60));
    alerts.addQuery("state","IN", "Open,Reopen,Flapping");
    alerts.addNullQuery("task");
    alerts.query();
    inputs['alertrecords'] = alerts;
    inputs['alerttype'] = alertType;
    inputs['alertdescription'] = alertDescription;
    sn_fd.FlowAPI.executeSubflow('global.create_incident_from_alert_list', inputs);

  }

}
