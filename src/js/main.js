/**
 * Created by Administrator on 2018/4/16.
 */

import {animal} from './animal' ;
import $ from 'jquery';
import '../css/importCss.css'

$(function(){
    init() ;
});

function init(){
    initClick() ;
}

function initClick(){
    $(".d1").click(function(){
        $(this).animate({height:"300px"},2000) ;
    });
    var tiger = new animal("tiger") ;
    tiger.sayhi() ;
}