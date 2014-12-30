
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

    imgList: [],

    frontImgIdx: 0,

    imgSongMap: [],

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

        $('#volume').on('click', function() {
            var x = $(this).offset().left,
                y = $(this).offset().top,
                height = 100;
                outerWidth1 = $(this).outerWidth(),
                outerWidth2 = $('#volume-slider').outerWidth();
            $('#volume-slider').css({
                'position': 'absolute',
                'left': x + (outerWidth1 - outerWidth2) / 2 + 'px',
                'top': y - height + 'px',
                'height': height
            });
            $('#volume-slider').css('display','block');
            $(document).on('click', function() {
                $('#volume-slider').css('display','none');
                $(document).off('click');
            });
            return false;
        });

        $('#volume-slider').slider({
            min: 0,
            max: 100,
            value: host.defaultPlayer.volume * 100,
            slide: function(event, ui) {
                var defaultPlayer = host.defaultPlayer,
                    value = ui.value;
                defaultPlayer.volume = value / 100;
            }
        });
        $('#volume-slider').slider({
            orientation: "vertical"
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
                return false;
            });
            return false;
        });


        $('.img-card').bind('error', function() {
            this.src = "./favicon.png"
        });

        this.imgList.push($('.img-card.card1'));
        this.imgList.push($('.img-card.card2'));
        this.imgList.push($('.img-card.card3'));
        this.imgList.push($('.img-card.card4'));
        this.imgList.push($('.img-card.card5'));
        this.imgList.push($('.img-card.card6'));
        this.imgList.push($('.img-card.card7'));
        this.imgList.push($('.img-card.card8'));
        this.imgList.push($('.img-card.card9'));
        this.frontImgIdx = 0;

        this.addEventForPlayer();

        this.initSongList();

    },

    prepareFirstSong: function() {
        this.doPlayAudio(this.songsList[0]);
        this.defaultPlayer.pause();
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
                host.prepareFirstSong(host.songsList[0]);
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

    doShowArtistImg: function(songInfo) {
        var dist = this.dist,
            find = dist.find,
            imgNum = 9;
            rotateValue = this.rotateValue || 0;
        if (find) {
            rotateValue = rotateValue + dist.dir * dist.step * 40;
            this.frontImgIdx = (this.frontImgIdx + dist.dir * dist.step * (-1) + imgNum) % imgNum;
        } else {
            if (rotateValue === 0) {
                rotateValue = 360;
            } else {
                rotateValue = 0;
            }
            
            this.frontImgIdx = 0;
        }
        $('.show-container').css('transform', 'translateZ(-404.747px) rotateY(' + rotateValue + 'deg)');
        this.rotateValue = rotateValue;
        if (this.curSongIdx !== -1) {
            this.updateDirtyImg();
        } else {
            this.updateDirtyImgInterrupt(songInfo);
        }
        
    },

    updateDirtyImgInterrupt: function(songInfo) {
        var imgSongMap = this.imgSongMap || [],
            frontImgIdx = this.frontImgIdx,
            imgList = this.imgList;
        imgList[frontImgIdx].attr('src', songInfo.artistImg);
    },

    updateDirtyImg: function() {
        var imgSongMap = this.imgSongMap || [],
            frontImgIdx = this.frontImgIdx,
            curSongIdx = this.curSongIdx,
            songsList = this.songsList,
            imgList = this.imgList,
            len = songsList.length,
            step = 4,
            imgNum = 9,
            i;
        //update the front Img
        if (imgSongMap[frontImgIdx] !== songsList[curSongIdx].artistImg) {
            imgSongMap[frontImgIdx] = songsList[curSongIdx].artistImg;
            imgList[frontImgIdx].attr('src', songsList[curSongIdx].artistImg);
        }
        i = 1;
        while (i <= step) {
            var curI = (frontImgIdx + i) % imgNum,
                curS = (curSongIdx + i) % len;
            if (imgSongMap[curI] !== songsList[curS].artistImg) {
                imgSongMap[curI] = songsList[curS].artistImg;
                imgList[curI].attr('src', songsList[curS].artistImg);
            }
            i++;
        }
        i = 1;
        while (i <= step) {
            var curI = (frontImgIdx - i + imgNum) % imgNum,
                curS = (curSongIdx - i + len) % len;
            if (imgSongMap[curI] !== songsList[curS].artistImg) {
                imgSongMap[curI] = songsList[curS].artistImg;
                imgList[curI].attr('src', songsList[curS].artistImg);
            }
            i++;
        }
    },

    doPlayAudio: function(songInfo) {
        var audio = this.defaultPlayer,
            songsList = this.songsList,
            len = songsList.length;
        this.curMusic = songInfo;
        this.lastSongIdx = this.curSongIdx !== undefined ? this.curSongIdx : -1;
        this.nextSongIdx = this.curSongIdx !== undefined ? (this.curSongIdx + 1) % len : 0;
        this.curSongIdx = this.getIdxOfSong(songInfo);
        this.dist = this.getStepsForSwitch(this.lastSongIdx, this.curSongIdx, 4);
        this.doShowArtistImg(songInfo);
        audio.src = songInfo.audioUrl;
        audio.play();
        this.highLightItemInList(songInfo);
        this.changeLikeSongIcon(songInfo);
    },

    getStepsForSwitch: function(lastSongIdx, curSongIdx, step) {
        var songsList = this.songsList,
            len = songsList.length,
            i = 0;
            if (lastSongIdx === -1 || curSongIdx === -1) {
                return {find: false};
            }
            while (i <= step) {
                var idx = (i + lastSongIdx) % len;
                if (idx === curSongIdx)
                {
                    return {find: true, dir: -1, step: i};
                }
                i++;
            }
            i = 0;
            while (i <= step) {
                var idx = (lastSongIdx - i + len) % len;
                if (idx === curSongIdx)
                {
                    return {find: true, dir: 1, step: i};
                }
                i++;
            }
            
            return {find: false}
    },

    getIdxOfSong: function(songInfo) {
        var songsList = this.songsList,
            len = songsList.length,
            curNum = songInfo.number;
        for (var i = 0; i < len; i++) {
            if (curNum === songsList[i].number) {
                return i;
            }
        }
        return -1; //this song is not stored.
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
            this.doPlayAudio(songsList[this.nextSongIdx || 0]); 
        }
        
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

