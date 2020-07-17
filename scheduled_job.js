function checkAlerts(typeNumber,fromDate,toDate) {
  var alert = new GlideAggregate('em_alert');
  alert.addAggregate("COUNT","type.name");
  alert.addQuery('type.name',typeNumber);
  alert.addQuery('source','Netact');
  alert.addQuery("sys_created_on",'>=', gs.daysAgoStart(fromDate));
  alert.addQuery("sys_created_on",'<=', gs.daysAgoEnd(toDate));
  alert.groupBy("type.name");
  alert.groupBy("description");
  alert.query();
  return alert
}

function findIncident() {
  var incident = new GlideRecord('incident');
  incident.addQuery('short_description', '8502 threshold incident');
  incident.addQuery('state', 'IN', '1,2,3');
  incident.query();
  return incident
}
      

function incidentStatus() {
  var inc = findIncident();
  if (inc.next()) {
    return true;
  }
  else {
    return false;
  }
}
  
var a = 1;
var b = 1;
var c = 2;
var d = 2;
var alert8502Yesterday = checkAlerts('8502', a, b);
var alert9047Yesterday = checkAlerts('9047', a, b);
var alert8502TwoDaysAgo = checkAlerts('8502', c, d);
var alert9047TwoDaysAgo = checkAlerts('9047', c, d);


alert8502Yesterday.next();
alert9047Yesterday.next();
alert8502TwoDaysAgo.next();
alert9047TwoDaysAgo.next();

var alertCount8502Yesterday = alert8502Yesterday.getAggregate("COUNT","type.name");
var alertCount9047Yesterday = alert9047Yesterday.getAggregate("COUNT","type.name");
var alertCount8502TwoDaysAgo = alert8502TwoDaysAgo.getAggregate("COUNT","type.name");
var alertCount9047TwoDaysAgo = alert9047TwoDaysAgo.getAggregate("COUNT","type.name");
//alertCount9047Yesterday=0;

if (alertCount8502Yesterday > 99 & (alertCount8502Yesterday / alertCount9047Yesterday) > 2 ) {
  gs.addInfoMessage("Alarm numbers above threshold.");
  gs.addInfoMessage("Type: " + alert8502Yesterday.getDisplayValue("type.name") + "," + alert8502Yesterday.getDisplayValue("description") + ", # of alerts yesterday: " + alertCount8502Yesterday);
  gs.addInfoMessage("Type: " + alert9047Yesterday.getDisplayValue("type.name") + "," + alert9047Yesterday.getDisplayValue("description") + ", # of alerts yesterday: " + alertCount9047Yesterday);
  gs.addInfoMessage("Ratio: " + (alertCount8502Yesterday / alertCount9047Yesterday));
  if (incidentStatus()) {
    gs.addInfoMessage('Incident exists. Do nothing');
  }
  else {
    gs.addInfoMessage('Incident does not exist. Create new incident.');
    var newIncident = new GlideRecord('incident');
    newIncident.initialize();
    newIncident.caller_id.setDisplayValue('Event Management');
    newIncident.category.setDisplayValue('Radio');
    newIncident.subcategory.setDisplayValue('Service Degradation');
    newIncident.assignment_group.setDisplayValue('SN Radio Performance');
    newIncident.short_description.setDisplayValue('8502 threshold incident');
    newIncident.description.setDisplayValue('Number of Netact alarm 8502 No Connection to BTS above threshold');
    newIncident.comments.setDisplayValue('[code]Number of alarm 8502 yesterday: ' + alertCount8502Yesterday +'<br>Number of alarm 9047 yesterday: ' + alertCount9047Yesterday +'<br>Ratio of 8502 to 9047 alarms: ' + (alertCount8502Yesterday / alertCount9047Yesterday) +'[\code]');
    newIncident.u_incident_type.setDisplayValue('Network Incident');
    newIncident.insert();
  }
}

else {
  gs.addInfoMessage("Alarm numbers below threshold. Do not generate incident");
  
  if (incidentStatus()) {
    gs.addInfoMessage("Incident exists. Check if it should be cleared.");
    if ((alertCount8502Yesterday < 10 & alertCount8502TwoDaysAgo < 100) | ((alertCount8502Yesterday / alertCount9047Yesterday) < 4 & (alertCount8502TwoDaysAgo / alertCount9047TwoDaysAgo) < 4)) {
      gs.addInfoMessage("Alarm numbers below threshold and incident exists. Clear incident");
      var incidentToBeCleared = findIncident();
      incidentToBeCleared.next();
      gs.addInfoMessage("Found incident " + incidentToBeCleared.getDisplayValue('number'));
      incidentToBeCleared.state = 7;
      incidentToBeCleared.close_code.setDisplayValue('Automatically cleared');
      incidentToBeCleared.comments.setDisplayValue('[code]Number of alarm 8502 yesterday: ' + alertCount8502Yesterday +'<br>Number of alarm 8502 two days ago: ' + alertCount8502TwoDaysAgo +'<br>Ratio of 8502 to 9047 alarms yesterday: ' + (alertCount8502Yesterday / alertCount9047Yesterday) +'<br>Ratio of 8502 to 9047 alarms two days ago: ' + (alertCount8502TwoDaysAgo / alertCount9047TwoDaysAgo) +'<br>The values are below threshold. Closing incident.[\code]');
      incidentToBeCleared.update();
    }
    else {
      gs.addInfoMessage('Incident exists, but numbers are above threshold. Do nothing.');
    }
  }
  else {
    gs.addInfoMessage("Incident does not exist. Do nothing.");
  }
}