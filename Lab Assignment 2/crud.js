window.onload=pageLoad();

function pageLoad(){
    $.ajax({
        url:'https://usmanlive.com/wp-json/api/stories',
        method:'GET',
        success:(response)=>{
            console.log(response);
            let story= $("#storiesList");
            story.addClass("bg-dark");
            story.addClass("text-light");
            story.addClass("p-4");

    for (let index = 1; index < response.length; index++) {
        const part = response[index];
        console.log(part.id);
        story.append(`<h1>Story ${index}</h1>`)
        story.append(`<h3>Index</h3>`)
        story.append(`<div id=ID><p>${part.id}</p></div>`);
        story.append(`<h2>Title:</h2>`)
        story.append(`<div id=title titleId=${part.title}><p>${part.title}</p></div>`);
        story.append(`<h2>Content:</h2>`)
        story.append(`<div id="content" contentId="${part.content}"><p>${part.content}</p></div>`);
        let edit=$(`<button id=edit editID=${part.id} >Edit</button>`);
        edit.addClass('bg-light');
        story.append(edit);
        let del=$(`<button id=del storyID=${part.id} =>delete</button>`);
        del.addClass('bg-light');
        story.append(del);
    }
 
    $('#del').on('click',storyDel);
    $('#edit').on('click',function() {
        storyEdit(response,this);});
     $('#add').on('click', create);
    
},
error:function () { 
    alert("An error has occured")
 }
});

}
function storyDel() {
    let btn=$(this);
    let Id=btn.attr('storyID');
    console.log(Id);

    $.ajax({
        url:'https://usmanlive.com/wp-json/api/stories/'+Id,
        method:'DELETE',
        success:function () {
           pageLoad();
           location.reload();
          },
        error:function () { 
            alert("An error has occured")
         }
        


    })
  }


  function storyEdit(response,editnbtn) {
    let edit = $(editnbtn); 
    let storyId = edit.attr('editID');
   
    
    for (let index = 1; index < response.length; index++) {
        if (storyId==response[index].id) {
            var uptitle=response[index].title;;
            var upContent=response[index].content;
            break;
        }  
        else{
            console.log("Not Found");
        }
    }
    console.log("Story ID:", storyId);
    console.log("Current Title:", uptitle);
    console.log("Current Content:", upContent);
    

    var updateId=$('#storyId');
    var updateTitle=$('#storyTitle');
    var updateContent=$('#storyContent');
    updateId.val(storyId);
    updateTitle.val(uptitle);
    updateContent.val(upContent);

    $('#storyForm').on('submit',function (event) { 
        event.preventDefault();
        let updatedId=updateId.val();
        let updatedti=updateTitle.val();
        let updatedContent=updateContent.val();
        $.ajax({
        
            url:'https://usmanlive.com/wp-json/api/stories/'+storyId,
            method:'PUT',
            data:{
                content:updatedContent,
                title:updatedti
            },
            success:function() {
                location.reload();
            },
            error:function () { 
                alert("An error has occured")
             }
            
        
     });

    });
}
function create() {
    let updateTitle = $('#storyTitle');
    let updateContent = $('#storyContent');

    $('#storyForm').on('submit', function (event) {
        event.preventDefault();
        var title = updateTitle.val();
        var content = updateContent.val();
        $.ajax({
            url: 'https://usmanlive.com/wp-json/api/stories/',
            method: 'POST',
            data: { title, content },
            success: function () {
                location.reload();
            },
            error: function () {
                alert("An error has occurred");
            }
        });
    });
}