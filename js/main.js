                // Initialize app
var myApp = new Framework7();
var $$ = Dom7;

                // пара глобальных фун-ий
function sorting(arr){  //Просто сортировка по датам
    arr.sort(function (a, b) {
        return a - b;
    });
}

var locStor = {  //более удобное общение с локалсторадж
    set: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get: function (key) {
        return JSON.parse(localStorage.getItem(key));
    }
};

var main = {
    resave: false,
    currentId: 0,
    firstCome: function(){ //Проверка локалсторадж. Если пусто, создаем стартовый объект
      var obj;

        this.getMainControlls();

        if(!locStor.get('td_all')){
          obj = {
            notes: [
                {
                    id: '1',
                    date: '01.01.20',
                    time: '13:01',
                    title: 'Test Title',
                    description: 'Test Description',
                    priority: 'high'
                },
                {
                    id: '2',
                    date: '23.11.18',
                    time: '10:30',
                    title: 'Test Title2',
                    description: 'Test Description2',
                    priority: 'low'
                },
                {
                    id: '3',
                    date: '27.09.05',
                    time: '20:42',
                    title: 'Test Title3',
                    description: 'Test Description3',
                    priority: 'medium'
                }
            ]
          };
          locStor.set('td_all', obj);

          this.getNotesList();
      }else{
          this.getNotesList();
      }
    },
    getNotesList: function(priority){  //Создаем список задач
        $$('#tasksList').html('');

        var template,
            cont,
            html,
            arr = locStor.get('td_all').notes,
            arrAfterFilter = [];

        if(priority){
            for(var y = 0; y < arr.length; y++){
                if(arr[y].priority == priority){
                    arrAfterFilter.push(arr[y]);
                }
            }
            arr = arrAfterFilter;
        }

        arr.sort(function (a, b) {
            if(a.date == '--.--.--' || a.time == '--:--'){
                a = 9999999999999;
            }else{
                a = new Date(a.date.split('.')[1]+'-'+a.date.split('.')[0]+'-'+a.date.split('.')[2]+' '+a.time).getTime();
            }

            if(b.date == '--.--.--' || b.time == '--:--'){
                b = 9999999999999;
            }else{
                b = new Date(b.date.split('.')[1]+'-'+b.date.split('.')[0]+'-'+b.date.split('.')[2]+' '+b.time).getTime();
            }
            return b - a;
        });

        for(var i = 0; i < arr.length; i++){
            if(new Date(arr[i].date.split('.')[1]+'-'+arr[i].date.split('.')[0]+'-'+arr[i].date.split('.')[2]+' '+arr[i].time).getTime() < new Date().getTime()){
                arr[i].overdue = true;
            }
        }

        var new_obj = {
            xxx: arr
        };

        template = '{{#each xxx}}' +
            '<li class="swipeout" data-id="{{id}}">' +
                '<div class="swipeout-content item-content">'+
                    '<div class="item-media priority {{priority}}">' +
                        '<div></div>' +
                    '</div>' +
                    '<div class="item-inner {{#if overdue}}overdue{{/if}} {{#if done}}done{{/if}}">' +
                        '<div class="title">{{title}}</div>' +
                        '<div class="description">{{description}}</div>' +
                        '<div class="date">{{date}} <span>{{time}}</span></div>' +
                        '<div class="more"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="swipeout-actions-right">' +
                    '<a href="#" class="swipeout-delete deleteBtn" data-id="{{id}}"></a>' +
                '</div>' +
            '</li>' +
            '{{/each}}';

        cont = Template7.compile(template);
        html = cont(new_obj);
        $$('#tasksList').append(html);

        this.getControllsOfList();
    },
    getControllsOfList: function(){   //Клики в новосозданном списке задач
        $$('.item-inner').on('click', function(){
            main.resave = true;
            main.currentId = $$(this).parent().parent().attr('data-id');
            main.buildPopup();
            myApp.popup.open('.popup-create');
        });

        $$('.more').on('click', function () {
            event.stopPropagation();
            myApp.swipeout.open($$(this).parent().parent().parent());
        });

        $$('.deleteBtn').on('click', function(){
            event.stopPropagation();
            main.deleteTask($$(this).attr('data-id'));
        });
    },
    deleteTask: function(id){
        var obj = locStor.get('td_all'),
            index = 0;
        for(var i = 0; i < obj.notes.length; i++){
            if(obj.notes[i].id == id){
                index = i;
            }
        }

        obj.notes.splice(index,1);
        locStor.set('td_all', obj);
    },
    getMainControlls: function(){
        $$('.createTaskBtn').on('click', function(){
            main.resave = false;
            main.buildPopup();
            myApp.popup.open('.popup-create');
        });
        $$('.closePopupBtn').on('click', function(){
            myApp.popup.close('.popup-create');
        });
        $$('.dateLabel, .priorityLabel').on('click', function(){
            $$('#datePickerContainer').html('');
            switch($$(this).find('input').prop('id')){  //Инициируем пикеры
                case 'calendarInput':
                    myApp.calendar.create({
                        inputEl: '#calendarInput',
                        containerEl: '#datePickerContainer',
                        dateFormat: 'dd.mm.yy'
                    });
                    $$('.pickerContainer').addClass('show');
                    break;
                case 'timeInput':
                    $$('.pickerContainer').addClass('show');
                    myApp.picker.create({
                        inputEl: '#timeInput',
                        containerEl: '#datePickerContainer',
                        rotateEffect: true,
                        formatValue: function (p, values, displayValues) {
                            return values[0] + ':' + values[1];
                        },
                        cols: [
                            {
                                values: (function () {
                                    var arr = [];
                                    for (var i = 0; i <= 23; i++) { arr.push(i); }
                                    return arr;
                                })()
                            },
                            {
                                divider: true,
                                content: ':'
                            },
                            {
                                values: (function () {
                                    var arr = [];
                                    for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                                    return arr;
                                })()
                            }
                        ]
                    });
                    break;
                case 'priorityInput':
                    $$('.pickerContainer').addClass('show');
                    myApp.picker.create({
                        inputEl: '#priorityInput',
                        containerEl: '#datePickerContainer',
                        rotateEffect: true,
                        formatValue: function (p, values, displayValues) {
                            switch(values[0]){
                                case 'Высокий':
                                    $$('.withPriorityAfter  div').removeClass('green').removeClass('orange').addClass('red');
                                    break;
                                case 'Средний':
                                    $$('.withPriorityAfter  div').removeClass('green').removeClass('red').addClass('orange');
                                    break;
                                case 'Низкий':
                                    $$('.withPriorityAfter  div').removeClass('red').removeClass('orange').addClass('green');
                                    break;
                            }
                            return values[0];
                        },
                        cols: [
                            {
                                values: (function () {
                                    var arr = ['Высокий','Средний','Низкий'];
                                    return arr;
                                })()
                            }
                        ]
                    });
                    break;
            }
        });
        $$('.confirmBtn').on('click', function(){
            $$('.pickerContainer').removeClass('show');
        });
        $$('.saveBtn').on('click', function(){
            main.checkFields();
        });

        $$('#priorityFilter').on('input',function(){
           main.doFilter($$('#priorityFilter').val());
        });
    },
    doFilter: function(val){
        switch(val){
            case 'Высокий':
                $$('.filterLabel').removeClass('green').removeClass('orange').addClass('red');
                val = 'high';
                main.getNotesList(val);
                break;
            case 'Средний':
                $$('.filterLabel').removeClass('green').removeClass('red').addClass('orange');
                val = 'medium';
                main.getNotesList(val);
                break;
            case 'Низкий':
                $$('.filterLabel').removeClass('red').removeClass('orange').addClass('green');
                val = 'low';
                main.getNotesList(val);
                break;
            case 'Нет Фильтра':
                $$('.filterLabel').removeClass('red').removeClass('orange').removeClass('green');
                val = false;
                main.getNotesList();
                break;
        }
    },
    checkFields: function(){
        var title = $$('#titleInput').val(),
            description = $$('#descriptionInput').val(),
            date = $$('#calendarInput').val(),
            time = $$('#timeInput').val(),
            priority = $$('#priorityInput').val();

        if(title == '' || description == '' || priority == ''){
            myApp.notification.create({
                text: 'Пожалуйста, заполните поля - заголовок, описание и приоритет'
            }).open();
            setTimeout(function(){
                myApp.notification.close();
            },3000);
        }else{
            switch(priority){
                case 'Высокий':
                    priority = 'high';
                    break;
                case 'Средний':
                    priority = 'medium';
                    break;
                case 'Низкий':
                    priority = 'low';
                    break;
            }

            if(date == ''){
                date = '--.--.--';
            }
            if(time == ''){
                time = '--:--';
            }

            if(main.resave){
                main.resaveTask(title, description, date, time, priority);
            }else{
                main.saveTask(title, description, date, time, priority);
            }
        }
    },
    saveTask: function(title, description, date, time, priority){
        var obj = locStor.get('td_all'),
            id = Math.round(Math.random() * (999999999 - 1) + 1);
        for(var i = 0; i < obj.notes.length; i++){
            if(obj.notes[i].id == id){
                id++;
                i = 0;
            }
        }
        obj.notes.push({
            id: id,
            date: date,
            time: time,
            title: title,
            description: description,
            priority: priority
        });
        locStor.set('td_all', obj);

        myApp.popup.close('.popup-create');
        this.getNotesList();
    },
    resaveTask: function(title, description, date, time, priority){
        var obj = locStor.get('td_all'),
            index = 0;
        for(var i = 0; i < obj.notes.length; i++){
            if(obj.notes[i].id == main.currentId){
                index = i;
            }
        }
        obj.notes[index].date = date;
        obj.notes[index].description = description;
        obj.notes[index].title = title;
        obj.notes[index].time = time;
        obj.notes[index].priority = priority;
        obj.notes[index].done = $$('#doneCheckbox').prop('checked');
        obj.notes[index].doneTime = $$('.checkboxLabel span').html();
        locStor.set('td_all', obj);

        myApp.popup.close('.popup-create');
        this.getNotesList();
    },
    buildPopup: function(){
        if(main.resave){
            $$('.popup .title').html('Редактировать задачу');
            var obj = locStor.get('td_all'),
                index = 0;
            for(var i = 0; i < obj.notes.length; i++){
                if(obj.notes[i].id == main.currentId){
                    index = i;
                }
            }

            $$('.checkboxLabel').show();
            if(obj.notes[index].done){
                $$('#doneCheckbox').prop('checked', true);
                $$('.checkboxLabel span').html(obj.notes[index].doneTime);
            }else{
                $$('#doneCheckbox').prop('checked', false);
                $$('.checkboxLabel span').html('');
            }
            $$('#doneCheckbox').on('change', function(){
                if($$('#doneCheckbox').prop('checked')){
                    var date = new Date().getDate()+'.'+(new Date().getMonth()+1)+'.'+new Date().getFullYear().toString().slice(2),
                        h = new Date().getHours(),
                        m = new Date().getMinutes();
                    if(h < 10) {
                        h = '0' + h;
                    }
                    if(m < 10) {
                        m = '0' + m;
                    }
                    $$('.checkboxLabel span').html(date+' '+h+':'+m);
                }else{
                    $$('.checkboxLabel span').html('');
                }
            });

            $$('#titleInput').val(obj.notes[index].title);
            $$('#descriptionInput').val(obj.notes[index].description);
            if(obj.notes[index].time == '--:--'){
                $$('#timeInput').val('');
            }else{
                $$('#timeInput').val(obj.notes[index].time);
            }
            if(obj.notes[index].date == '--.--.--'){
                $$('#calendarInput').val('');
            }else{
                $$('#calendarInput').val(obj.notes[index].date);
            }

            var currentPriority;

            switch(obj.notes[index].priority){
                case 'high':
                    $$('.withPriorityAfter div').removeClass('green').removeClass('orange').addClass('red');
                    currentPriority = 'Высокий';
                    $$('#priorityInput').val(currentPriority);
                    break;
                case 'medium':
                    $$('.withPriorityAfter div').removeClass('green').removeClass('red').addClass('orange');
                    currentPriority = 'Средний';
                    $$('#priorityInput').val(currentPriority);
                    break;
                case 'low':
                    $$('.withPriorityAfter div').removeClass('red').removeClass('orange').addClass('green');
                    currentPriority = 'Низкий';
                    $$('#priorityInput').val(currentPriority);
                    break;
            }
        }else{
            $$('.popup .title').html('Создать задачу');

            $$('.withPriorityAfter div').removeClass('red').removeClass('orange').removeClass('green');
            $$('#titleInput').val('');
            $$('#descriptionInput').val('');
            $$('#calendarInput').val('');
            $$('#timeInput').val('');
            $$('#priorityInput').val('');
            $$('.checkboxLabel').hide();
        }
    }
};

document.addEventListener('DOMContentLoaded', ready, false); //по окончании прогрузки стартуем
function ready() {
    main.firstCome();
}

myApp.init();

//TODO думаю, это все можно отлично отрефакторить, но так как я делаю проект с нуля и за одну ночь, придется смириться и жить с этим :(