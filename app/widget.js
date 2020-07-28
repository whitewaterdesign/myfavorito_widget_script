var chris_debug;

$(document).ready(function() {
    //var content = $('#external-content');
    //content.load(content.attr('data-external-url'));  
    const modal = document.createElement('div');
    modal.id = "myf_modal";
    let modal_inner_content = document.createElement('div');
    modal_inner_content.id = "myf_item_modal";
    
    modal.appendChild(modal_inner_content);
    
    document.body.appendChild(modal);
});

const myf_modal_url = function(url) { };

const muurigrid_modal = function(data,template) {

    let myelement = template;
    
    let my_contact = '';
    
    if(
        typeof data.contact != "undefined" && 
        (
            (data.contact.phone !="" && typeof data.contact.phone != 'undefined') ||
            (data.contact.email !="" && typeof data.contact.email != 'undefined') ||
            (data.contact.website !="" && typeof data.contact.website != 'undefined')
        )
    ) {
        my_contact = '$1<div class="mu_item_contact"><strong>${Contact}</strong>$0<br />';
        if(!data.contact.phone=='') {
            my_contact = my_contact + '<p><span class="glyphicon glyphicon-earphone" aria-hidden="true"></span> ' + data.contact.phone + '</p>';
        }
        
        if(!data.contact.email=='') {
            my_contact = my_contact + '<p><span class="glyphicon glyphicon-envelope" aria-hidden="true"></span> ' + data.contact.email + '</p>';
        }
        
        if(!data.contact.website=='') {
            my_contact = my_contact + '<p><span class="glyphicon glyphicon-globe" aria-hidden="true"></span> <a href="' + data.contact.website + '" target="_blank">' + data.contact.website + '</a></p>';
        }	
        
        my_contact = my_contact + '</div>';
    }

    let placeholder_array = Object.keys(data);
    let business_hours = '';
    let open_hours = '';
    
    // set up business hours info
    if(data.type == 'store' && typeof data.businesshours != 'undefined' && typeof data.businesshours[1] != 'undefined') {
        
        let today = new Date();
        dayOfWeek = today.getDay();
        dayOfWeek++;
        
        business_hours = '<div class="mu_item__today show"></div>';
        business_hours = business_hours + '<div class="mu_item__businesshours hide"><strong>$1${Business hours}$0</strong><br />';

        const daysOfWeek = {
            1: '$1${Sunday}',
            2: '${Monday}',
            3: '${Tuesday}',
            4: '${Wednesday}',
            5: '${Thursday}',
            6: '${Friday}',
            7: '${Saturday}',
            h: '${Holiday}$0' 
        };
        
        // get data for each day
        [2,3,4,5,6,7,1,'h'].forEach(value => {
            let hours = data.businesshours[value].active == '1' ? data.businesshours[value].start.hour + ':' +  data.businesshours[value].start.minute + ' - ' + data.businesshours[value].end.hour + ':' +  data.businesshours[value].end.minute : "$1${Closed}$0";

            business_hours = business_hours + '<div class="mu_item_b_day trading'+hours.includes(":")+'">' + daysOfWeek[value] + ':</div><div class="mu_item_b_hours trading'+hours.includes(":")+'">' + hours + '</div>';
            if(value == dayOfWeek) {
                if(hours.includes(":")) {
                    let start_hour = parseInt(data.businesshours[value].start.hour);
                    let start_minute = parseInt(data.businesshours[value].start.minute)
                    let end_hour = parseInt(data.businesshours[value].end.hour)
                    let end_minute = parseInt(data.businesshours[value].end.minute)
                    
                    let startTime = new Date();
                    startTime.setHours(start_hour,start_minute)
                    let endTime = new Date();
                    endTime.setHours(end_hour,end_minute);
                    
                    if(today >= startTime && today <= endTime) {
                        open_hours = '$1<strong>${Open until}</strong> $0' + data.businesshours[value].end.hour + ':' + data.businesshours[value].end.minute;
                    } else {
                        open_hours = '$1<strong>${Closed}</strong>$0';
                    }
                    
                    
                } else {
                    open_hours = '$1${Closed}$0';
                }
            }
        });
        
        business_hours = business_hours + '<br /></div><div class="mu_item__today show">'+open_hours+'</div><div class="cleaner clear"></div><br />';
    }

    if(data.type == 'loyalty') {
        myelement = myelement.replace('{data.points.percentage}', Math.min(100, parseInt(data.points.percentage)));
        myelement = myelement.replace('{data.points.required}', data.points.required);
        myelement = myelement.replace('{data.points.collected}', data.points.collected);
        myelement = myelement.replace('{data.points.text}', data.points.text);
    }
    
    /*const trunc = 
    <a href="{data.url}">$1${More details}$0</a>
    
      function(n){
          (this.length > n) ? this.substr(0, n-1) + '&hellip;' : this;
      };*/
    if(data.text == '') {
        myelement = myelement.replace('{data.text}', business_hours);
        myelement = myelement.replace('{data.businesshours}', '');
    }
    
    
    if(data.text && data.text.length < 200) {
        myelement = myelement.replace('{data.text}', data.text + business_hours);
        myelement = myelement.replace('{data.businesshours}', '');
    }
    
    // replace template placeholders
    placeholder_array.forEach(value => {
        if(value == 'contact') {
            myelement = myelement.replace('{data.contact}', my_contact);
        } else if(value == 'businesshours') {
            myelement = myelement.replace('{data.businesshours}',business_hours);
        } else {
            myelement = myelement.replace('{data.'+value+'}', data[value]);
            myelement = myelement.replace('{data.'+value+'}', data[value]);	
            myelement = myelement.replace('{data.'+value+'}', data[value]);	
            myelement = myelement.replace('{data.br-'+value+'}', data[value] != '' ? data[value] +'<br />':'');
        }
        
    });

    if(
        (typeof data.street != 'undefined' && data.street != '') || 
        (typeof data.city != 'undefined' && data.city != '') || 
        (typeof data.zip != 'undefined' && data.zip != '') ||
        (typeof data.country_iso != 'undefined' && data.country_iso != '') 
    ) {
        myelement = myelement.replace('{data.address-title}','<strong>$1${Address}$0</strong><br />')
    }

    // remove all extra tags
    let re = /\{data\.n*\}/g;
    
    myelement = myelement.replace(re,'');
    
    let inner_content = document.getElementById('myf_item_modal');
    inner_content.innerHTML = myelement;
    inner_content.classList.add(data.type);
    
    sm_modal = document.getElementById('myf_modal');
    
    sm_modal.classList.add("active");
    
    
    setTimeout(function(){
        document.body.addEventListener('click', sm_click_off_widget);
        document.getElementById('myf_modal').addEventListener('click', sm_click_off_widget);
        inner_content.classList.add("active");
    }, 10);
    
    let sm_post_close = document.getElementById('mu_item__close');
    sm_post_close.addEventListener('click', sm_close_widget);
    
    document.addEventListener('keydown', sm_key_off_widget);
}

const sm_close_widget = function(e) {
    let webclient_modal = document.getElementById('myf_modal');
    let webclient_modal_inner = document.getElementById('myf_item_modal');
    webclient_modal.classList.remove("active");
    webclient_modal_inner.classList.remove("active","promotion","store");
    document.body.removeEventListener('click', sm_click_off_widget);
    if(typeof e != 'undefined') {
        e.preventDefault();
    }
};

const sm_close = function(e) {
    sm_close_widget(e);
};
        
const sm_click_off_widget = function(e) {
    let webclient_modal = document.getElementById('myf_modal');
    let webclient_modal_inner = document.getElementById('myf_item_modal');
    if (!webclient_modal_inner.contains(e.target)) {sm_close_widget();}
};
        
const sm_key_off_widget = function(e) {
    let webclient_modal = document.getElementById('myf_modal');
    let webclient_modal_inner = document.getElementById('myf_item_modal');
    if(e.key == "Escape"){sm_close_widget();}
};

const get_modal_widget = function(url) {

    $.post({
        url:url,
        crossDomain: true,
		//contentType: "text/plain",
		xhrFields: {
      		withCredentials: true
   		},
        beforeSend: function() {
            // activate modal
            var webclient_modal = document.getElementById('myf_modal');
            webclient_modal.classList.add("active");
        },
        success: function(data){
            /*
            creates this html
            
            <div class="community-content--full-size">
                <a id="cm_item__close" href="#">
                    <img src="/portals/mcdapp/design/icons/close.svg" alt="x">
                </a>
                <div id="ajax-content">
                </div>
            </div>
            
            */
            // fix any relative url issues - create absolute url
            data = data.replace(/\ssrc=\"\//g,' src="https://www.myfavorito.com/');
            data = data.replace(/\shref=\"\//g,' href="https://www.myfavorito.com/');
            data = data.replace(/\saction=\"\//g,' action="https://www.myfavorito.com/');

            // initialise main content div
            let community_content = document.createElement('div');
            community_content.classList.add('community-content--full-size');
            
            // inialise close element
            let cm_item_close = document.createElement('a');
            cm_item_close.id = 'cm_item__close';
            cm_item_close.setAttribute("href", "#");
            cm_item_close.innerHTML = '<img src="https://www.myfavorito.com/portals/mcdapp/design/icons/close.svg" alt="x">';
            
            // add cm_item__close a tag as child of community-content--full-size div
            community_content.appendChild(cm_item_close);
            
            // initialise ajax content holder
            let inner_content = document.createElement('div');
            inner_content.id = 'ajax-content';
            // insert ajax data into ajax-content div
            inner_content.innerHTML = data;
            
            // add ajax holder as new child of main content div
            community_content.appendChild(inner_content);
            
            // get modal inner div
            var webclient_modal_inner = document.getElementById('myf_item_modal');
            
            // clear modal of old children
            while (webclient_modal_inner.lastElementChild) {
                webclient_modal_inner.removeChild(webclient_modal_inner.lastElementChild);
            }
            
            // add community-content--full-size div as child of modal div
            webclient_modal_inner.appendChild(community_content);
            
            // get modal inner div
            var webclient_modal_inner = document.getElementById('myf_item_modal');
            webclient_modal_inner.classList.add("active");
            
            // add event listeners to close the modal box
            setTimeout(function(){
                document.body.addEventListener('click', sm_click_off_widget); // close if click on body
                document.getElementById('myf_modal').addEventListener('click', sm_click_off_widget); // close if click on modal bground
                webclient_modal_form_ehandler_link();
            }, 10);
            
            cm_item_close.addEventListener('click', sm_close_widget); // close if click x close box
            document.addEventListener('keydown', sm_key_off_widget); // close if press esc
        },
        async: false
    });
};

const webclient_modal_form_ehandler_link = function() {
    let webclient_modal_ajax = document.getElementById("ajax-content"); 
    webclient_modal_ajax.addEventListener('click',webclient_modal_event_click_a);
    webclient_modal_ajax.addEventListener('submit',webclient_modal_event_form);
};

const webclient_modal_event_click_a = function(e) {
    
    let target = e.target;

    if(target.href != undefined){
        
        if (
            target.href  == "#" ||
            target.href.includes("javascript") ||
            target.classList.contains('js-off')
        ) { return true };
        
        e.preventDefault();

        let viewport_url = target.href;
        
        let ajax_content = $('#ajax-content');

        $.ajax({
            url: viewport_url,
            method: 'POST',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            data: "modal=1",
            beforeSend: function(){
                ajax_content.fadeTo('fast', 0.5);
            }
        }).done(function(data){
            data = data.replace(/\ssrc=\"\//g,' src="https://www.myfavorito.com/');
            data = data.replace(/\shref=\"\//g,' href="https://www.myfavorito.com/');
            data = data.replace(/\saction=\"\//g,' action="https://www.myfavorito.com/');
            ajax_content.html(data);
        }).always(function(){
            ajax_content.fadeTo('fast', 1);
        });
    } else {console.log('undefined');}
};
/*var baseUrl = 'http://my.hardcoded.url/';
$.ajaxSetup({
    beforeSend: function(xhr, options) {
        options.url = baseUrl + options.url;
    }
})*/
const webclient_modal_event_form = function(e) {
    
    var $input = $(e.target);
    var $form = $input.closest('form');
    var $submitter = $(e.submitter);

    if ( $form.hasClass('js-off') || $form.closest('.js-off').get(0) ) return true;
    
    e.preventDefault();
    
    //console.log(e.submitter.name);
    //console.log(submitter);
    //console.log($submitter);

    var opt = {
        target : '#ajax-content',
        crossDomain: true,
		xhrFields: {
      		withCredentials: true
   		},
        data : {
                'X-Requested-With':'AjaxFormSubmit',
                'modal':'1'
        },
        beforeSubmit : function(){
            $('input, select', $form).prop('disabled',true);
            $form.fadeTo('fast', 0.5);
        },
        success : function(data){
            console.log(data);
            data = data.replace(/\ssrc=\"\//g,' src="https://www.myfavorito.com/');
            data = data.replace(/\shref=\"\//g,' href="https://www.myfavorito.com/');
            data = data.replace(/\saction=\"\//g,' action="https://www.myfavorito.com/');
            console.log(data);
            $form.fadeTo('fast', 1);
            $('input:submit, select', $form).prop('disabled',false);
        },
        error : function(){
            $form.fadeTo('fast', 1);
            $('input:submit, select', $form).prop('disabled',false);
        }
    };
    opt.data[$input.attr('name')] = $input.attr('value') || '';
    opt.data[$submitter.attr('name')] = '1';
    
    console.log(opt.data);

    $form.ajaxSubmit(opt);
};
