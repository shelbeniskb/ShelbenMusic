
var host = {

    palyBtn: null,

    volumeBtn: null,

    nextBtn: null,

    searchPopList: [],

    searchInput: null,

    searchBtn: null,

    searchResultNode: null,

    curStatus: 0, //0 表示Pause， 1 表示 Play

    songName: null,

    artistName: null,

    showSlider: false,

    init: function() {
        this.playBtn = $('#play')[0];
        this.palyIcon = $('#play-icon')[0];
        this.volumeBtn = $('#volume')[0];
        this.nextBtn = $('#next')[0];
        this.likeBtn = $('#like')[0];
        this.searchInput = $('#search_input');
        this.searchBtn = $('#search_btn')[0];
        this.defaultPlayer = $('#player_default')[0];
        this.artistImg = $("#artist-img")[0];
        this.lrcTitle = $("#lrc-title")[0];
        this.lrcContent = $("#lrc-content")[0];
        this.lrcLine = $(".lrc-row");
        this.sliderPage = $('#slider-page');
        this.sliderTrigger = $('#slider-trigger');
        this.sliderContorl = $('#slider-ctrl');

        $('#search_input').on('keydown', function(e){
            if (e.keyCode === 13) {
                host.doSearchSong(this.value);
            }
        });
        $('#search_btn').on('click', function(e){
            host.doSearchSong($('#search_input').value);
        });

        $('#play').on('click', function(e) {
            var defaultPlayer = host.defaultPlayer;
            if (defaultPlayer.src) {
                host.togglePlay(host.defaultPlayer);
            }
        });

        $('#like').on('click', function(e){
            $.ajax({
                type: 'post',
                data: {'name':'Love', 'singer': 'JF', 'url': 'http://m1.music.126.net/WXNbrvMx9JgDE8KydUjEVw==/3218270534505816.mp3', 'time': 10000},
                url: 'http://chn-kehu:8217/addSong',
                success: function(data) {
                    console.log(data);
                }
            });
        })

        $('#slider-trigger').on('click', function() {
            if (host.showSlider === false) {
                host.sliderPage.addClass('show');
                host.sliderContorl.addClass('roate');
                host.showSlider = true;
            } else {
                host.sliderPage.removeClass('show');
                host.sliderContorl.removeClass('roate');
                host.showSlider = false;
            }
            
        });

    },

    handleCallback: function(response) {
        var result = response.result,
            code = response.code;
        if (code === 200 && result) {
            this.showResultPop(result.songs);
        } else {
            alert("No Result!");
        }
    },

    handleCallbackForLrc: function(response) {
        console.log(response);
    },

    showResultPop: function(songs) {
        var len = songs.length,
            x = this.searchInput.offset().left,
            y = this.searchInput.offset().top + this.searchInput.outerHeight() + 1;
            width = this.searchInput.outerWidth();
        if (len === 0) {
            return;
        }
        var ulDom = document.createElement('ul');
        ulDom.className = "list-group";
        ulDom.style.position = "absolute";
        ulDom.style.left = x + 'px';
        ulDom.style.top = y + 'px';
        ulDom.style.width = width + 'px';
        for (var i = 0; i < len; i++) {
            var liDom = document.createElement('li');
            liDom.innerHTML = songs[i].name + '   ' + songs[i].artists[0].name;
            liDom.className = "list-group-item";
            liDom.audioUrl = songs[i].audio;
            liDom.artistImg = songs[i].album.picUrl;
            liDom.artistName = songs[i].artists[0].name;
            liDom.songName = songs[i].name;
            liDom.addEventListener('click', function() {
                host.songName = this.songName;
                host.artistName = this.artistName;
                host.doPlayAudio(this.audioUrl);
                host.doShowArtistImg(this.artistImg);
                host.doSearchLrc(this.songName, this.artistName);
                host.searchResultNode.parentNode.removeChild(host.searchResultNode);
            });
            ulDom.appendChild(liDom);
            host.searchResultNode = ulDom;
        }
        document.body.appendChild(ulDom);
    },

    doShowArtistImg: function(imgUrl) {
        var imgUrl = imgUrl || "./gem.jpg";
        this.artistImg.src = imgUrl;
    },

    doPlayAudio: function(audioUrl) {
        var audio = this.defaultPlayer;
        audio.src = audioUrl;
        audio.addEventListener('canplaythrough', function() {
            host.togglePlay(this);
        });
    },

    dealwithLrc: function(lrc) {
        var array = lrc.split('['),
            len = array.length,
            lrcArr = [],
            reg = new RegExp('^\\d');
        for (var i = 0; i < len; i++) {
            var result = array[i].split(']');
            if (result.length > 1) {
                if (reg.test(result[0])) {
                    lrcArr.push({time: result[0], content: result[1]});
                }
            }
        }

        for (var i = lrcArr.length - 1; i >= 0; i--) {
            if (lrcArr[i].content === "" && i !== lrcArr.length - 1) {
                lrcArr[i].content = lrcArr[i + 1].content;
            }
        }

        for (var i = 0; i < lrcArr.length; i++) { //convert string to time
            var time = lrcArr[i].time.split(":"),
                timeFloat;
            if (time.length > 1) {
                timeFloat = parseFloat(time[0])*60*1000 + parseFloat(time[1])*1000; 
                lrcArr[i].time = timeFloat;
            } else {
                console.log("lrc error 1");
            }
        } 

        function compare(a, b) {
            return a.time - b.time;
        } 

        lrcArr.sort(compare);       

        this.showLrc(lrcArr);

    },

    showLrc: function(lrcArr) {
        var idx = 0,
            len = lrcArr.length,
            time = 0,
            defaultPlayer = this.defaultPlayer,
            totTime = defaultPlayer.duration * 1000;
        this.lrcTitle.innerHTML = this.songName;
        var timer = window.setInterval(function(){
            var curTime = defaultPlayer.currentTime * 1000;
            if (curTime >= totTime || idx >= lrcArr.length) {
                window.clearInterval(timer);
            } else {
                if (curTime > lrcArr[idx].time) {
                    if (idx - 2 >= 0) {
                       host.lrcLine[0].innerHTML = lrcArr[idx-2].content; 
                    } else {
                       host.lrcLine[0].innerHTML = "" ;
                    }
                    if (idx - 1 >= 0) {
                       host.lrcLine[1].innerHTML = lrcArr[idx-1].content; 
                    } else {
                       host.lrcLine[1].innerHTML = "" ;
                    }

                    host.lrcLine[2].innerHTML = lrcArr[idx].content;

                    if (idx + 1 < len - 1) {
                        host.lrcLine[3].innerHTML = lrcArr[idx+1].content;
                    } else {
                        host.lrcLine[3].innerHTML = "";
                    }  
                    if (idx + 2 < len - 1) {
                        host.lrcLine[4].innerHTML = lrcArr[idx+2].content;
                    } else {
                        host.lrcLine[4].innerHTML = "";
                    } 
                    idx++; 
                }
            }
        },100);
    },

    doDownloadLrc: function(lrcResult) {
        var result = lrcResult.result,
            audioUrl;
        if (result.length === 0) {
            return;
        }
        url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + result[0].lrc + '"') + '&format=xml';
        $.ajax({
            type: "GET",
            url: url,
            success: function(text){
                text = text.split("<p>")[1].split("</p>")[0];
                host.dealwithLrc(text);
            },
            error: function(){
            },
            dataType: "text"
        });
    },

    doSearchLrc: function(songName, artistName) {
        var url = "http://geci.me/api/lyric/" + encodeURI(songName) + '/' + encodeURI(artistName);
        url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + '"') + '&format=xml';
        $.ajax({
            type: "GET",
            url: url,
            success: function(text){
                text = text.split("<p>")[1].split("</p>")[0];
                var jsonResult =  JSON.parse(text);
                host.doDownloadLrc(jsonResult);
            },
            error: function(){
                alert("Error");
            },
            dataType: "text"
        });
    },

    togglePlay: function(defaultPlayer) {
        if (this.curStatus === 0) {
            this.curStatus = 1;
            this.palyIcon.className = "glyphicon glyphicon-pause";
            defaultPlayer.play();
        } else {
            this.curStatus = 0;
            this.palyIcon.className = "glyphicon glyphicon-play";
            defaultPlayer.pause();
        }
    },

    doSearchSong: function(value) {
        $.ajax({
            type: "GET",
            url: "http://s.music.163.com/search/get/?type=1&&s=" + encodeURI(value),
            dataType:'jsonp',
            jsonp: 'callback',
            jsonpCallback: 'host.handleCallback'
        });
    }
}

$(document).ready(function(){
    host.init();
});

function handleCallbackForLrc(response) {
    console.log(response);
}
