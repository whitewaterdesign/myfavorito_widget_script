let myF_data_map;

const webclient_grid_init = function(settings) {
    let muurigrid_query = [];
    var grid;
    let object_count;
    let call_url = postVar.url();

    if(!call_url.includes('?')) {
        call_url += '?';
    } 

    $.ajax({
        url:call_url + '&count=1',
        async: false,
        success: function(data) {
            //console.log('count',data);
            object_count = data.count;
        }
    });

    let search = {
        page: 1,
        limit: 20
    }
    
    const templates = postVar.templates;

    if(
        typeof performance != 'undefined' && 
        typeof performance.getEntriesByType != 'undefined' &&
        typeof performance.getEntriesByType("navigation")[0] != 'undefined' &&
        performance.getEntriesByType("navigation")[0].type == 'reload'
    ) { 
        const scrolltop = document.getElementById('js_scroller').offsetTop;
        if(window.scrollY > scrolltop){ 
            window.scrollTo(0, scrolltop)	
        }
    }
        
    // make all code asynchronous
    setTimeout(function(){ 
    
        const newSkeletonCard = function() { 
            const uniqueNu = new Date().valueOf();
            const min=0; 
            const max=2; 
            let el = document.createElement('div');
            let random_nu = Math.floor(Math.random() * (+max - +min)) + +min; 
            let random_class = "w" + random_nu;
            el.classList.add('myf-item-large',random_class);
            el.innerHTML = '<a href="#" class="myf-item myf-item-new" data-id="-1"></a></div>';	
            return el;
        };
        
        const createSkeletonArray = function(left,limit) { 
            let count = Math.min(Math.max(left,0),limit);
            let item_elements = [];
            for (i = 0; i < count; i++) {
                item_elements.push(newSkeletonCard());
            } 
            
            return item_elements;
        }
        
        const addSkeletonCards = function(left,limit) { 
            let elements = createSkeletonArray(left,limit);
            elements.forEach(function(element){ 
                document.getElementById('muuri-card-deck').appendChild(element);
            });
        }
        
        const createMyItem = function(sm_post){ 

            let points = '';
            if(sm_post.owner_points) {
                points = '<div class="item-points">'+sm_post.owner_points+'</div>';
            }
            //return myf_item = '<a href="'+sm_post.url+'" class="myf-item" data-id="'+sm_post.id+'"><img src="'+sm_post.src+'" alt="'+sm_post.title+'"><div class="item-bottom"><div class="item-title">'+sm_post.title+'</div></div><div class="cleaner clear"></div></a>';
            return myf_item = points+'<img src="'+sm_post.src+'" alt="'+sm_post.title.replace(/"/g, "&#39;")+'"><div class="item-bottom"><div class="item-title">'+sm_post.title+'</div></div><div class="cleaner clear"></div>';
        }
        
        const muurigrid_modal_click = function(event) { 
            
            event.preventDefault();
            let data_id;
            
            if(this.dataset.id) {
                data_id = this.dataset.id;
            } else {
                data_id = event.currentTarget.dataset.id;
            }
            let c_page = myF_data_map[data_id];
            //console.log(c_page);
            muurigrid_modal(c_page);
            if(c_page.type ==  'promotion') {
                setTimeout(function(){ 
                    $.get({ 
                        url:'https://www.myfavorito.com/?t=/webclient/controller/promos/log&promoid='+c_page.id
                    });
                },1000);
            }
             //settings.promo_log(event.currentTarget.dataset.id);
            
        }
        
        const getMuurigridMix  = function(search) { 
            const min=0; 
            const max=2; 

            $.get( postVar.url(search.page), function(data){ 

                // process each of the items
                if(typeof data.count != 'undefined') {
                    object_count = data.count;
                }
                
                var item_elements = [];
                let elements = document.querySelectorAll('a[data-id="-1"]');
                
                if(elements.length < 1) { 
                    addSkeletonCards(elements.length,5000);
                }
                
                muurigrid_query = muurigrid_query.concat(data);
                
                data.data.forEach((sm_post,i) => { 
                    // get the container
                    //elements = $('a[data-id="-1"]');
                    let element = document.querySelector('a[data-id="-1"]');

                    sm_post.url = sm_post.url ? sm_post.url : sm_post.link.store;

                    let myf_item = document.createElement('a');
                    myf_item.setAttribute('href',sm_post.url);
                    myf_item.setAttribute('data-id',sm_post.id ? sm_post.id : sm_post.ozid);
                    myf_item.classList.add('myf-item');
                    myf_item.addEventListener('click', muurigrid_modal_click);
                    myf_item.innerHTML = createMyItem(sm_post);
                    
                    let points = '';
                    if(sm_post.owner_points) {
                        points = '<div class="item-points">'+sm_post.owner_points+'</div>';
                    }
                    
                    if(element)  { 
                        el = element.parentElement;
                        el.innerHTML = '';
                        el.appendChild(myf_item);
                    } else { 
                        el = document.createElement('div');
                        let random_nu = Math.floor(Math.random() * (+max - +min)) + +min; 
                        let random_class = "w" + random_nu;
                        el.classList.add('myf-item-large',random_class);
                        el.appendChild(myf_item);
                        item_elements.push(el);
                    }

                    myF_data_map[sm_post.id] = sm_post;
                });
                grid.add(item_elements);      
                          
            },"json");
        }

        // update information on entry being observed
        var intersector = document.getElementById('js_scroller');	

        const refreshResults = function(data) { 
            
            if(typeof data != 'undefined'){ 
                let search = data;
                document.getElementById('muuri-card-deck').innerHTML = '';
            }
            
            // turn off limiting for IE11 and for a result count of less than limit
            if(!'IntersectionObserver' in window || !object_count>search.limit) { 
                search.limit=5000;
                getMuurigridMix(search);
    
                grid = new Muuri('#muuri-card-deck', { 
                    items: '.myf-item-large', 
                    layout: { fillGaps:true}
                });
                
            } else { 
                // initiate first set of data - should be limited to 10
                getMuurigridMix(search,object_count,search.limit);
                
                search.page = 2;

                // number of results not visible on page
                var elements_left = object_count - search.limit;
                
                addSkeletonCards(elements_left,search.limit);
                
                grid = new Muuri('#muuri-card-deck', { 
                    items: '.myf-item-large', 
                    layout: { fillGaps:true}
                });
                
                const intersector = document.getElementById('js_scroller');	
                let intersectors2 = document.querySelectorAll('.myf-item-new');
                
                // create config details for IntersectionObserver - viewport
                
                if(elements_left>0){ 
                    const config = { 
                      rootMargin: '0px 0px 600px 0px', //
                      threshold: [0.25, 0.5, 1] // only fire observer when half of entry is in viewport
                    };
        
                    //setTimeout(function(){ },1);
                    var interSectionCount = 0;
                    
                    // initialise observer object / function
                    let observer = new IntersectionObserver(function (entries, self) { 
                    entries.forEach(entry => { 
                        if (entry.isIntersecting) { 
                            //console.log(search.page);
                      
                            // fire when object enters viewport
                            getMuurigridMix(search,elements_left,search.limit);
        
                            ++search.page;
                            elements_left = elements_left - search.limit;	
                            
                            let skeleton_items = createSkeletonArray(elements_left,search.limit);
                            
                            if(skeleton_items.length){ 
                                grid.add(skeleton_items);
                            } 
                            
                            // when there are no more objects to load disconnect intersection observer
                            if(elements_left<1){ 
                                intersector.remove();
                                self.disconnect();
                                //observer2.disconnect();
                            } else { 
                                
                            }
                            interSectionCount = 0;
                        }
                      });
                    }, config);
    
                    observer.observe(intersector);
                }
            }
        };
        
        // initiate results
        refreshResults();
        
        var sm_modal_global = document.getElementById('modal');
        var inner_content_global = document.getElementById('myf_item_modal');
    },0);
}