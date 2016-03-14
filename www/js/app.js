///// Called when app launch
$(function() {
  // User Creditials
  $("#LoginBtn").click(onLoginBtn);
  $("#RegisterBtn").click(onRegisterBtn);
  $("#YesBtn_logout").click(onLogoutBtn);
  //Event Create, Edit, Update and Delete
  $("#SaveBtn").click(onSaveBtn);
  $("#EditBtn").click(onEditBtn);
  $("#UpdateBtn").click(onUpdateBtn);
  $("#YesBtn_delete").click(deleteEvent);
  // Other tools
  $("#SearchUsersBtn").click(SearchUsers);
  $('a').buttonMarkup({ corners: false });
  //profile crud below
  $("#ProfileDSaveBtn").click(onProfileSaveBtn);
  $("#ProfileEditBtn").click(onProfileEditBtn);
  $("#ProfileUpdateBtn").click(onProfileUpdateBtn);
  $("#ProfileDeleteBtn").click(onProfileDeleteBtn);
});
        var currentEventID;
        var MC = monaca.cloud;
/////////////////////////////////////////////////////
function onRegisterBtn(){
    var userTitle = $("#reg_username").val(); 
    var email = $("#reg_email").val(); 
    var password = $("#reg_password").val(); 
    var firstname = $("#reg_fname").val();
    var lastname = $("#reg_lname").val();
    console.log(MC);
    MC.User.register(email, password, {firstname:firstname,lastname:lastname,userTitle:userTitle})
    .done(function(){
        $.mobile.changePage('#LoginPage');
        console.log('login: '  + MC.User._oid);
        MC.Collection("users").insert({firstname:firstname,lastname:lastname,userTitle:userTitle,email:email,password:password});
        //MC.Mailer.sendMail(MC.User._oid,"App_data_response",{firstname:firstname, lastname:lastname});
    })
    .fail(function(err){
        console.log('FAILED');
            alert('Registration failed!');
        console.error(JSON.stringify(err));
    });
}
function onLoginBtn(){
  var email = $("#login_email").val();
  var password = $("#login_password").val();
  console.log(MC)
  MC.User.login(email, password)
    .done(function(){
        console.log('login: '  + MC.User._oid);
      getEventList();
      //getProfileDetails();
      $.mobile.changePage('#ListPage');
    })
    .fail(function(err){
        alert('Login failed: ' + err.message);
        console.error(JSON.stringify(err));
    });
}
function onLogoutBtn()
{
  MC.User.logout()
    .done(function(){
        console.log('Logout is success!');
        $.mobile.changePage('#LoginPage');
    })
    .fail(function(err){
        alert('Logout failed!');
        console.error(JSON.stringify(err));
    });
}
//////////////////////////////////////////////////
function onSaveBtn()
{
  var title = $("#title").val();
  var location = $("#location").val();
  var content = $("#content").val();
  var startdate = $("#startdate").val(); 
  var starttime = $("#starttime").val();
  var endtime = $("#endtime").val();
  //var imgupload = $("imgupload").val();
  if (title != '')
  {
    addEvent(title,location,content,startdate,starttime,endtime);// add image img tag for picture ass well 'imgupload'
  }
}

function addEvent(title,location,content,startdate,starttime,endtime) { // for imgupload add imgupload
  var eve = MC.Collection("events");

  eve.insert({ title: title, location: location , content: content, startdate: startdate, starttime: startdate, endtime: endtime}) // for imgupload add imgupload
  .done(function(insertedItem)
  {
    console.log('Insert is success!');
    $("#title").val("");
    $("#location").val("");
    $("#content").val("");
    $("#startdate").val("");
    $("#starttime").val("");
    $("#endtime").val("");
  //$("imgupload").val("");

    // display a dialog stating that the inserting is success
    $("#okDialog_add").popup("open", {positionTo: "origin"}).click(function(event)
    {
      getEventList();
      $.mobile.changePage('#ListPage');
      MC.Mailer.sendMail(MC.User._oid,"App_event_response",{firstname:firstname, lastname:lastname});
    });
  })
  .fail(function(err){
    if (err.code == -32602) {
      alert("Collection 'Event' not found! Please create collection from IDE.");
    } else {
      console.error(JSON.stringify(err));
      alert('Insert failed!');
    }
  })
}

function onShowLink(id, title, location, content, startdate, starttime, endtime)
{
  currentEventID = id;
  $("#title_show").text(title);
  $("#location_show").text(location);
  $("#content_show").text(content);
  $("#startdate_show").text(startdate);
  $("#starttime_show").text(starttime);
  $("#endtime_show").text(endtime);
//$("#imgupload_show").text(imgupload);
  $.mobile.changePage("#ShowPage");
}

function onDeleteBtn(id)
{
  currentEventID = id;
  $( "#yesNoDialog_delete" ).popup("open", {positionTo: "origin"})
}

function deleteEvent()
{
  console.log('yes');
  var eve = MC.Collection("events");
  eve.findOne(MC.Criteria("_id==?", [currentEventID]))
    .done(function(item)
    {
      console.log(JSON.stringify(item));
      item.delete()
      .done(function()
       {
          console.log("The event is deleted!");
          getEventList();
          $.mobile.changePage("#ListPage");
       })
       .fail(function(err){
           console.log("Fail to delete the item.");
       });
      
    })
    .fail(function(err){
      console.error(JSON.stringify(err));
      alert('Insert failed!');
    });
}

function onEditBtn()
{
  var title = $("#title_show").text();
  var location = $("#location_show").text();
  var content = $("#content_show").text();
  var startdate = $("#startdate_show").text();
  var starttime = $("#starttime_show").text();
  var endtime = $("#endtime_show").text();
//var imgupload = $("#imgupload_show").text();
  $("#title_edit").val(title);
  $("#location_edit").val(location);
  $("#content_edit").val(content);
  $("#startdate_edit").val(startdate);
  $("#starttime_edit").val(starttime);
  $("#endtime_edit").val(endtime);
//$("#imgupload").val(imgupload);
  $.mobile.changePage("#EditPage");
}

function onUpdateBtn()
{
  var new_title = $("#title_edit").val();
  var new_location = $("#location_edit").val();
  var new_content = $("#content_edit").val();
  var new_startdate = $("#startdate_edit").val();
  var new_starttime = $("#starttime_edit").val();
  var new_endtime = $("#endtime_edit").val();
//var new_imgupload = $("#imgupload_edit").val();
  var id = currentEventID;
  if (new_title != '') {
    editEvent(id, new_title, new_location ,new_content, new_startdate, new_starttime, new_endtime); //for imgupload add new_imgupload
  }
}

function editEvent(id, new_title, new_location, new_content, new_startdate, new_starttime, new_endtime){// for imgupload new_imgupload
  var eve = MC.Collection("events");
  eve.findMine(MC.Criteria("_id==?", [id]))
    .done(function(items, totalItems)
    {
      items.items[0].title = new_title;
      items.items[0].location = new_location;
      items.items[0].content = new_content;
      items.items[0].startdate = new_startdate;
      items.items[0].starttime = new_starttime;
      items.items[0].endtime = new_endtime;
      //items.items[0].imgupload = new_imgload;
      items.items[0].update()
        .done(function(updatedItem)
        {
          console.log('Updating is success!');
          //display a dialog stating that the updating is success
          $( "#okDialog_edit" ).popup("open", {positionTo: "origin"}).click(function(event)
          {
            getEventList();
            $.mobile.changePage("#ListPage");
          });
        })
        .fail(function(err){ console.error(JSON.stringify(err)); });
    })
    .fail(function(err){
      console.error(JSON.stringify(err));
    });
}

function getEventList() {
  console.log('Refresh List');
  var MC = monaca.cloud;
  var eve = MC.Collection("events");
  eve.findMine()
    .done(function(items, totalItems)
    {
        console.log("all: " + JSON.stringify(items));
      $("#ListPage #TopListView").empty();
      var list = items.items;

      for (var i in list)
      {
        var eve = list[i];
        var d = new Date(eve._createdAt);
        //var date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate(); -- Orignal One --
        //var date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
        $li = $("<li><a href='javascript:onShowLink(\"" + eve._id + "\",\"" + eve.title + "\",\"" + eve.location + "\",\"" + eve.content + "\",\"" + eve.startdate + "\",\"" + eve.starttime + "\",\"" + eve.endtime + "\")' class='show'><h3></h3><p></p></a><a href='javascript:onDeleteBtn(\"" + eve._id + "\")' class='delete'>Delete</a></li>");
        //$li.find("p").text(date);
        $li.find("h3").text(eve.title);
        $("#TopListView").prepend($li);
      }
      if (list.length == 0) {
        $li = $("<li>No Event found</li>");
        $("#TopListView").prepend($li);
      }
      $("#ListPage #TopListView").listview("refresh");
    })
  .fail(function(err){
    if (err.code == -32602) {
      alert("Collection 'Event' not found! Please create collection from IDE.");
    } else {
      console.error(JSON.stringify(err));
      alert('Insert failed!');
    }
  });
}


function SearchUsers(){
    var UserSe = $("#Usearch").val();
    var FindUser = monaca.cloud.Criteria('userTitle == '+UserSe+'');
    User.find(FindUser,"_createdAt DESC", {propertyNames: ["userTitle"],limit: 5})
    .done(function(result)
    {
       console.log('Total items found: ' + result.totalItems);
       console.log('The body of the first item: ' + result.items[0].userTitle);
       document.getElementById("results").innerHTML = result.items[0].userTitle;

    })
    .fail(function(err)
    {
       console.log("Err#" + err.code +": " + err.message);
    });
}

// profile crud below
function onProfileEditBtn()
{
  var firstname = $("#fname_show").text();
  var lastname = $("#lname_show").text();
  var username = $("#uname_show").text();
  var userTitle = $("#utitle_show").text();
  var password = $("#upass_show").text();
//var imgupload = $("#imgupload_show").text();
  $("#fname_edit").val(firstname);
  $("#lname_edit").val(lastname);
  $("#uname_edit").val(username);
  $("#utitle_edit").val(userTitle);
  $("#upass_edit").val(password);
//$("#imgupload").val(imgupload);
  $.mobile.changePage("#EditProfilePage");
}

function onProfileUpdateBtn()
{
  var new_firstname = $("#fname_edit").val();
  var new_lastname = $("#lname_edit").val();
  var new_username = $("#uname_edit").val();
  var new_userTitle = $("#utitle_edit").val();
  var new_password = $("#upass_edit").val();
//var new_imgupload = $("#imgupload_edit").val();
  var id = currentProfileID;
  if (new_username != '') {
    editProfile(id, new_firstname, new_lastname ,new_username, new_userTitle, new_password); //for imgupload add new_imgupload
  }
}
function onProfileSaveBtn(){
    
}
function onProfileDeleteBtn(){
    
}

function editProfile(id, new_firstname, new_lastname, new_username, new_userTitle, new_password){// for imgupload new_imgupload
  var Puser = MC;
  Puser.findMine(MC.Criteria("_id==?", [id]))
    .done(function(items, totalItems)
    {
      items.items[0].firstname = new_firstname;
      items.items[0].lastname = new_lastname;
      items.items[0].username = new_username;
      items.items[0].userTitle = new_userTitle;
      items.items[0].password = new_password;
      //items.items[0].imgupload = new_imgload;
      items.items[0].update()
        .done(function(updatedItem)
        {
          console.log('Updating is success!');
          //display a dialog stating that the updating is success
          $( "#okDialog_edit" ).popup("open", {positionTo: "origin"}).click(function(event)
          {
            getEventList();
            $.mobile.changePage("#ProfilePage");
          });
        })
        .fail(function(err){ console.error(JSON.stringify(err)); });
    })
    .fail(function(err){
      console.error(JSON.stringify(err));
    });
}
function showProfile(){
    var profileuser = MC.Device.getProperties(firstname,lastname,Username,Password,userTitle);
    
    $("fname_show").val(firstname);
    $("lname_show").val(lastname);
    $("uname_show").val(Username);
    $("utitle_show").val(userTitle);
    $("upass_show").val(Password);
    
}