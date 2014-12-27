
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

    songsList: [],

    init: function() {
        this.playBtn = $('#play')[0];
        this.playIcon = $('#play-icon')[0];
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

        $('#search_input').on('input', function(e){
            if (e.keyCode === 13) {
                host.doSearchSong(this.value);
            }
        });
        $('#search_input').on('keyup', function(e){
            host.doSearchSong(this.value);
        });
        $('#search_btn').on('click', function(e){
            host.doSearchSong($('#search_input')[0].value);
        });

        $('#play').on('click', function(e) {
            var defaultPlayer = host.defaultPlayer;
            if (defaultPlayer.src) {
                host.togglePlay(host.defaultPlayer);
            }
        });

        $('#next').on('click', function() {
            host.doPlayNext();
        });

        $('#like').on('click', function(e) {
            var curMusic = host.curMusic;
            if (curMusic) {
                $.ajax({
                    type: 'POST',
                    data: curMusic,
                    url: 'http://chn-kehu:8217/addSong',
                    success: function(data) {
                        console.log(data);
                        if (data.success) {
                            host.initSongList();
                        }
                    }
                });
            }
        });


        $('#slider-trigger').on('click', function() {
            if (host.showSlider === false) {
                host.sliderPage.addClass('show');
                host.sliderContorl.addClass('rotate');
                host.showSlider = true;
            } else {
                host.sliderPage.removeClass('show');
                host.sliderContorl.removeClass('rotate');
                host.showSlider = false;
            }
        });

        $('#signin-link').on('click', function() {
            $('.rotate-container').css('transform', 'rotateY(' + 0 + 'deg)');
        });

        $('#signup-link').on('click', function() {
            $('.rotate-container').css('transform', 'rotateY(' + 180 + 'deg)');
        });

        $('#user-container').on('click', function(e) {
            $('#overlay').css('display', 'block');
            $('#user-login-signup').css('display', 'block');
            $(document).on('click', function() {
                $('#overlay').css('display', 'none');
                $('#user-login-signup').css('display', 'none');
                $(document).off('click');
            });
            $('#user-login-signup').on('click', function(e) {
                e.stopPropagation();
            });
            e.stopPropagation();
        });

        this.addEventForPlayer();

        this.initSongList();



    },

    addEventForPlayer: function() {
        var media = this.defaultPlayer;
        media.addEventListener('play', function() {
            host.playIcon.className = "glyphicon glyphicon-pause";
        });
        media.addEventListener('pause', function() {
            host.playIcon.className = "glyphicon glyphicon-play";
        });
        media.addEventListener('ended', function() {
            host.doPlayNext();
        });
        media.addEventListener('canplay', function() {
            var curMusic = host.curMusic;
            if (curMusic && !curMusic.time) {
                curMusic.time = this.duration;
            }
        });
    },

    initSongList: function() {
        $.ajax({
            type: "POST",
            url: "http://chn-kehu:8217/getSongList",
            success: function(data) {
                host.drawSongList(data);
            }
        });
    },

    drawSongList: function(data) {
        var songs = data.songs,
            rowContainer = $('#song-row-container')[0];
        this.songsList = songs;
        while (rowContainer.firstChild) { //remove all the old children DOM node
            rowContainer.removeChild(rowContainer.firstChild);
        }
        for(var i = 0; i < songs.length; i++) {
            var rowElem = this.createSongRow(i, songs[i]);
            rowContainer.appendChild(rowElem);
        }
        this.songListDom = rowContainer;
    },

    createSongRow: function(num, songInfo) {
        var tr = document.createElement('tr'),
            tdNum = document.createElement('td'),
            tdState = document.createElement('td'),
            tdName = document.createElement('td'),
            tdTime = document.createElement('td'),
            tdSinger = document.createElement('td'),
            time = songInfo.time,
            minute = parseInt(time / 60),
            second = parseInt(time - minute * 60);
        tdNum.innerHTML = num;
        tdName.innerHTML = songInfo.songName;
        tdTime.innerHTML = minute + ':' + second;
        tdSinger.innerHTML = songInfo.artistName;
        tr.appendChild(tdNum);
        tr.appendChild(tdState);
        tr.appendChild(tdName);
        tr.appendChild(tdTime);
        tr.appendChild(tdSinger);
        tr.songInfo = songInfo;
        tr.addEventListener('click', function(e){
            host.doPlayAudio(this.songInfo);
        })
        return tr;
    },

    handleCallback: function(response) {
        var result = response.result,
            code = response.code;
        if (code === 200 && result) {
            this.showResultPop(result.songs);
        } else {
            if (this.searchResultDom) {
                document.body.removeChild(this.searchResultDom);
                this.searchResultDom = null;
            }
            console.log("No Result!");
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
        if (this.searchResultDom) {
            document.body.removeChild(this.searchResultDom);
            this.searchResultDom = null;
        }
        var ulDom = document.createElement('ul');
        ulDom.className = "list-group";
        ulDom.style.position = "absolute";
        ulDom.style.left = x + 'px';
        ulDom.style.top = y + 'px';
        ulDom.style.width = width + 'px';
        for (var i = 0; i < len; i++) {
            var liDom = document.createElement('li'),
                songInfo = {songName: songs[i].name, artistName: songs[i].artists[0].name, audioUrl: songs[i].audio, artistImg: songs[i].album.picUrl, number: songs[i].id};
            liDom.innerHTML = songs[i].name + '   ' + songs[i].artists[0].name;
            liDom.className = "list-group-item";
            liDom.songInfo = songInfo;
            liDom.addEventListener('click', function() {
                var songInfo = this.songInfo;
                host.doPlayAudio(songInfo);
                if (host.searchResultDom) {
                    document.body.removeChild(host.searchResultDom);
                    host.searchResultDom = null;
                }
               /* $(document).off('click');*/
                
            });
            ulDom.appendChild(liDom);
        }
        this.searchResultDom = ulDom;
        document.body.appendChild(ulDom);
        $(document).on('click', function() {
            if (host.searchResultDom) {
                document.body.removeChild(host.searchResultDom);
                host.searchResultDom = null;
            }
            $(document).off('click');
        });
    },

    doShowArtistImg: function(imgUrl) {
        var imgUrl = imgUrl || "./gem.jpg";
        this.artistImg.src = imgUrl;
    },

    doPlayAudio: function(songInfo) {
        var audio = this.defaultPlayer;
        this.doShowArtistImg(songInfo.artistImg);
        this.clearLrcOld();
        this.doSearchLrc(songInfo.songName, songInfo.artistName);
        host.curMusic = songInfo;
        audio.src = songInfo.audioUrl;
        audio.play();
        this.lrcTitle.innerHTML = songInfo.songName;
        this.highLightItemInList(songInfo);
        this.changeLikeSongIcon(songInfo);
    },

    changeLikeSongIcon: function(songInfo) {
        var songsList = this.songsList,
            isStored = false;
        for (var i = 0; i < songsList.length; i++) {
            if (songInfo.number === songsList[i].number) {
                isStored = true;
                break;
            }
        }
        if (isStored) {
            this.likeBtn.children[0].className = "glyphicon glyphicon-heart like";
        } else {
            this.likeBtn.children[0].className = "glyphicon glyphicon-heart";
        }
    },

    highLightItemInList: function(songInfo) {
        var songListDom = this.songListDom,
            children = songListDom.children;
        $('tr.isPlaying').removeClass('isPlaying');
        $('td.showPlayIcon').removeClass('showPlayIcon');
        for (var i = 0; i < children.length; i++) {
            var Info = children[i].songInfo;
            if (Info.number === songInfo.number) {
                var tr = children[i],
                    state = tr.children[1];
                tr.className = 'isPlaying';
                state.className = 'showPlayIcon';
            }
        }
    },

    clearLrcOld: function() {
        if (this.lrcTimer) {
            window.clearInterval(this.lrcTimer);
        }
        this.lrcLine[0].innerHTML = "";
        this.lrcLine[1].innerHTML = "";
        this.lrcLine[2].innerHTML = "歌词加载中...";
        this.lrcLine[3].innerHTML = "";
        this.lrcLine[4].innerHTML = "";
    },

    doPlayNext: function() {
        var curMusic = this.curMusic,
            songsList = this.songsList,
            curNum = curMusic.number,
            idx = -1,
            nextNum;
        for (var i = 0; i < songsList.length; i++) {
            if (curNum === songsList[i].number) {
                idx = i;
            }
        }

        if (idx !== -1) {
            nextNum = (idx + 1)%songsList.length;
            this.doPlayAudio(songsList[nextNum]);
        } else {
            console.log("why idx will be -1?");
            this.doPlayAudio(songsList[0]);
        }
        
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
        host.lrcTimer = window.setInterval(function(){
            var curTime = defaultPlayer.currentTime * 1000;
            if (curTime >= totTime || idx >= lrcArr.length) {
                window.clearInterval(host.lrcTimer);
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
            console.log('搜不到歌词%>_<%');
            this.lrcLine[2].innerHTML = "搜不到歌词%>_<%";
        } else {
            url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + result[0].lrc + '"') + '&format=xml';
            $.ajax({
                type: "GET",
                url: url,
                success: function(text){
                    text = text.split("<p>")[1].split("</p>")[0];
                    host.dealwithLrc(text);
                },
                error: function(){
                    console.log('歌词下载失败%>_<%');
                    this.lrcLine[2].innerHTML = "歌词下载失败%>_<%";
                },
                dataType: "text"
            });
        }
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
        if (defaultPlayer.paused) {
            defaultPlayer.play();
        } else {
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
