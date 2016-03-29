'use strict';

// Load modules
require('bootstrap-webpack');

// Load custom modules
var setCSRFToken = require('../../module/setCSRFToken.js');
var setAuthToken = require('../../module/setAuthToken.js');
var clearAuthToken = require('../../module/clearAuthToken.js');

// Global variables
var pathName = window.location.pathname;
var surveyID = 1;
var resultID = pathName.match(/result\/(\d+)/)[1];
var rows;
var nameListForEconomicScoreException = ['김기현', '김무성', '김미희', '김선동', '김재연', '김재윤', '김진표', '김현숙', '남경필', '박명재', '박성효', '배기운', '서병수', '서청원', '성완종', '송광호', '신장용', '심학봉', '안덕수', '안종범', '안철수', '오병윤', '유정복', '윤진식', '이낙연', '이상규', '이석기', '이완구', '이용섭', '이운룡', '이재영(지역)', '정몽준', '조현룡', '한명숙', '현영희', '황인자'];
var staticData = [
                    {
                      "name": "강기윤",
                      "x": 5,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>강기윤 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "강창희",
                      "x": 5,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>강창희 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김재경",
                      "x": 5,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김재경 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김정훈",
                      "x": 5,
                      "y": 4,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김정훈 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "유승민",
                      "x": 5,
                      "y": 5,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>유승민 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "보수"
                    },
                    {
                      "name": "이상일",
                      "x": 5,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이상일 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이학재",
                      "x": 5,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이학재 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이한구",
                      "x": 5,
                      "y": 8,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이한구 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "홍문표",
                      "x": 5,
                      "y": 9,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>홍문표 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "황영철",
                      "x": 5,
                      "y": 10,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>황영철 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "강기정",
                      "x": -8,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>강기정 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "김우남",
                      "x": -8,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김우남 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "김윤덕",
                      "x": -8,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김윤덕 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "김현",
                      "x": -8,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김현 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "박범계",
                      "x": -8,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박범계 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "박영선",
                      "x": -8,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박영선 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "박완주",
                      "x": -8,
                      "y": 7,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박완주 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "신학용",
                      "x": -8,
                      "y": 8,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>신학용 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "진보"
                    },
                    {
                      "name": "유기홍",
                      "x": -8,
                      "y": 9,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>유기홍 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "윤관석",
                      "x": -8,
                      "y": 10,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>윤관석 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "이종걸",
                      "x": -8,
                      "y": 11,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이종걸 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "정호준",
                      "x": -8,
                      "y": 12,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>정호준 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "진보"
                    },
                    {
                      "name": "한정애",
                      "x": -8,
                      "y": 13,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>한정애 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "홍영표",
                      "x": -8,
                      "y": 14,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>홍영표 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "홍의락",
                      "x": -8,
                      "y": 15,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>홍의락 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "홍종학",
                      "x": -8,
                      "y": 16,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>홍종학 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "강길부",
                      "x": 10,
                      "y": 1,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>강길부 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "강석호",
                      "x": 10,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>강석호 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김기선",
                      "x": 10,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김기선 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김도읍",
                      "x": 10,
                      "y": 4,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김도읍 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김상훈",
                      "x": 10,
                      "y": 5,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김상훈 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김성찬",
                      "x": 10,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김성찬 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김세연",
                      "x": 10,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김세연 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김종훈",
                      "x": 10,
                      "y": 8,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김종훈 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김학용",
                      "x": 10,
                      "y": 9,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김학용 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "박민식",
                      "x": 10,
                      "y": 10,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>박민식 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "박성호",
                      "x": 10,
                      "y": 11,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>박성호 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "서상기",
                      "x": 10,
                      "y": 12,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>서상기 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "서용교",
                      "x": 10,
                      "y": 13,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>서용교 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "신경림",
                      "x": 10,
                      "y": 14,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>신경림 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "심재철",
                      "x": 10,
                      "y": 15,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>심재철 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "유일호",
                      "x": 10,
                      "y": 16,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>유일호 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "윤명희",
                      "x": 10,
                      "y": 17,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>윤명희 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이현재",
                      "x": 10,
                      "y": 18,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이현재 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "장윤석",
                      "x": 10,
                      "y": 19,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>장윤석 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "조명철",
                      "x": 10,
                      "y": 20,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>조명철 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "조해진",
                      "x": 10,
                      "y": 21,
                      "tooltip": "<table><tr><td>무소속 </td></tr><tr><td>조해진 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속 ",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "주호영",
                      "x": 10,
                      "y": 22,
                      "tooltip": "<table><tr><td>무소속 </td></tr><tr><td>주호영 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속 ",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "강동원",
                      "x": -14,
                      "y": 1,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>강동원 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "양승조",
                      "x": -14,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>양승조 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "정청래",
                      "x": -14,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>정청래 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "강석훈",
                      "x": 9,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>강석훈 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김광림",
                      "x": 9,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김광림 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김명연",
                      "x": 9,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김명연 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김을동",
                      "x": 9,
                      "y": 4,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김을동 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김장실",
                      "x": 9,
                      "y": 5,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김장실 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김희국",
                      "x": 9,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김희국 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "나성린",
                      "x": 9,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>나성린 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "안홍준",
                      "x": 9,
                      "y": 8,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>안홍준 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이노근",
                      "x": 9,
                      "y": 9,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이노근 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이이재",
                      "x": 9,
                      "y": 10,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이이재 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이장우",
                      "x": 9,
                      "y": 11,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이장우 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이주영",
                      "x": 9,
                      "y": 12,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이주영 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "함진규",
                      "x": 9,
                      "y": 13,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>함진규 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "홍일표",
                      "x": 9,
                      "y": 14,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>홍일표 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "홍지만",
                      "x": 9,
                      "y": 15,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>홍지만 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "강은희",
                      "x": 11,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>강은희 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "권성동",
                      "x": 11,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>권성동 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김영우",
                      "x": 11,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김영우 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김태원",
                      "x": 11,
                      "y": 4,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김태원 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김태흠",
                      "x": 11,
                      "y": 5,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김태흠 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김한표",
                      "x": 11,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김한표 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "박대출",
                      "x": 11,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>박대출 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "박덕흠",
                      "x": 11,
                      "y": 8,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>박덕흠 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "손인춘",
                      "x": 11,
                      "y": 9,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>손인춘 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "신동우",
                      "x": 11,
                      "y": 10,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>신동우 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "여상규",
                      "x": 11,
                      "y": 11,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>여상규 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "염동열",
                      "x": 11,
                      "y": 12,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>염동열 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이만우",
                      "x": 11,
                      "y": 13,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이만우 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이우현",
                      "x": 11,
                      "y": 14,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이우현 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이진복",
                      "x": 11,
                      "y": 15,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이진복 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이채익",
                      "x": 11,
                      "y": 16,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이채익 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이철우",
                      "x": 11,
                      "y": 17,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이철우 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "정갑윤",
                      "x": 11,
                      "y": 18,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>정갑윤 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "정문헌",
                      "x": 11,
                      "y": 19,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>정문헌 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "정수성",
                      "x": 11,
                      "y": 20,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>정수성 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "강창일",
                      "x": -9,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>강창일 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "김춘진",
                      "x": -9,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김춘진 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "김태년",
                      "x": -9,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김태년 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "도종환",
                      "x": -9,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>도종환 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "배재정",
                      "x": -9,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>배재정 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "서기호",
                      "x": -9,
                      "y": 6,
                      "tooltip": "<table><tr><td>정의당</td></tr><tr><td>서기호 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#FFCA08",
                      "groups": "정의당",
                      "econstring": "진보"
                    },
                    {
                      "name": "서영교",
                      "x": -9,
                      "y": 7,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>서영교 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "이미경",
                      "x": -9,
                      "y": 8,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이미경 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "이학영",
                      "x": -9,
                      "y": 9,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이학영 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "장하나",
                      "x": -9,
                      "y": 10,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>장하나 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "전순옥",
                      "x": -9,
                      "y": 11,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>전순옥 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "전해철",
                      "x": -9,
                      "y": 12,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>전해철 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "최원식",
                      "x": -9,
                      "y": 13,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>최원식 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "진보"
                    },
                    {
                      "name": "경대수",
                      "x": 12,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>경대수 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "류성걸",
                      "x": 12,
                      "y": 2,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>류성걸 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "박인숙",
                      "x": 12,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>박인숙 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "송영근",
                      "x": 12,
                      "y": 4,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>송영근 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "심윤조",
                      "x": 12,
                      "y": 5,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>심윤조 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이에리사",
                      "x": 12,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이에리사 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이한성",
                      "x": 12,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이한성 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "이헌승",
                      "x": 12,
                      "y": 8,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이헌승 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "최봉홍",
                      "x": 12,
                      "y": 9,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>최봉홍 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "권은희(새)",
                      "x": 8,
                      "y": 1,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>권은희(새) 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "보수"
                    },
                    {
                      "name": "김성태",
                      "x": 8,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김성태 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김정록",
                      "x": 8,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김정록 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김회선",
                      "x": 8,
                      "y": 4,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김회선 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김희정",
                      "x": 8,
                      "y": 5,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김희정 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "류지영",
                      "x": 8,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>류지영 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "문정림",
                      "x": 8,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>문정림 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "민병주",
                      "x": 8,
                      "y": 8,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>민병주 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "박창식",
                      "x": 8,
                      "y": 9,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>박창식 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "신성범",
                      "x": 8,
                      "y": 10,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>신성범 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "신의진",
                      "x": 8,
                      "y": 11,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>신의진 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "원유철",
                      "x": 8,
                      "y": 12,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>원유철 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "유승우",
                      "x": 8,
                      "y": 13,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>유승우 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "보수"
                    },
                    {
                      "name": "윤영석",
                      "x": 8,
                      "y": 14,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>윤영석 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "윤재옥",
                      "x": 8,
                      "y": 15,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>윤재옥 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이강후",
                      "x": 8,
                      "y": 16,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이강후 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이명수",
                      "x": 8,
                      "y": 17,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이명수 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이인제",
                      "x": 8,
                      "y": 18,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이인제 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "정우택",
                      "x": 8,
                      "y": 19,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>정우택 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "조원진",
                      "x": 8,
                      "y": 20,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>조원진 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "주영순",
                      "x": 8,
                      "y": 21,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>주영순 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "하태경",
                      "x": 8,
                      "y": 22,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>하태경 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "황진하",
                      "x": 8,
                      "y": 23,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>황진하 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "길정우",
                      "x": 6,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>길정우 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김종태",
                      "x": 6,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김종태 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "박상은",
                      "x": 6,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>박상은 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이병석",
                      "x": 6,
                      "y": 4,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이병석 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이완영",
                      "x": 6,
                      "y": 5,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이완영 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이종훈",
                      "x": 6,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이종훈 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "전하진",
                      "x": 6,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>전하진 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김경협",
                      "x": -7,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김경협 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "김영록",
                      "x": -7,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김영록 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "김영환",
                      "x": -7,
                      "y": 3,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>김영환 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "진보"
                    },
                    {
                      "name": "문재인",
                      "x": -7,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>문재인 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "우상호",
                      "x": -7,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>우상호 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "우원식",
                      "x": -7,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>우원식 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "이목희",
                      "x": -7,
                      "y": 7,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이목희 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "이상직",
                      "x": -7,
                      "y": 8,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이상직 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "전정희",
                      "x": -7,
                      "y": 9,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>전정희 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "진보"
                    },
                    {
                      "name": "최재성",
                      "x": -7,
                      "y": 10,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>최재성 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "김관영",
                      "x": -4,
                      "y": 1,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>김관영 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김승남",
                      "x": -4,
                      "y": 2,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>김승남 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김용익",
                      "x": -4,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김용익 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김한길",
                      "x": -4,
                      "y": 4,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>김한길 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "박남춘",
                      "x": -4,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박남춘 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "신경민",
                      "x": -4,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>신경민 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "이언주",
                      "x": -4,
                      "y": 7,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이언주 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "이찬열",
                      "x": -4,
                      "y": 8,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이찬열 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "조경태",
                      "x": -4,
                      "y": 9,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>조경태 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "주승용",
                      "x": -4,
                      "y": 10,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>주승용 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김광진",
                      "x": -10,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김광진 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "김기식",
                      "x": -10,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김기식 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "김민기",
                      "x": -10,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김민기 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "김상희",
                      "x": -10,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김상희 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "김성주",
                      "x": -10,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김성주 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "남인순",
                      "x": -10,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>남인순 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "심상정",
                      "x": -10,
                      "y": 7,
                      "tooltip": "<table><tr><td>정의당</td></tr><tr><td>심상정 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#FFCA08",
                      "groups": "정의당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "유승희",
                      "x": -10,
                      "y": 8,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>유승희 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "은수미",
                      "x": -10,
                      "y": 9,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>은수미 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "이인영",
                      "x": -10,
                      "y": 10,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이인영 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "진선미",
                      "x": -10,
                      "y": 11,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>진선미 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "진성준",
                      "x": -10,
                      "y": 12,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>진성준 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "홍익표",
                      "x": -10,
                      "y": 13,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>홍익표 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "김기준",
                      "x": -13,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김기준 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "박민수",
                      "x": -13,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박민수 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "정진후",
                      "x": -13,
                      "y": 3,
                      "tooltip": "<table><tr><td>정의당</td></tr><tr><td>정진후 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#FFCA08",
                      "groups": "정의당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "김동완",
                      "x": 4,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김동완 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "문대성",
                      "x": 4,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>문대성 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "정병국",
                      "x": 4,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>정병국 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김동철",
                      "x": -3,
                      "y": 1,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>김동철 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "박지원",
                      "x": -3,
                      "y": 2,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>박지원 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "변재일",
                      "x": -3,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>변재일 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "설훈",
                      "x": -3,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>설훈 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "오제세",
                      "x": -3,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>오제세 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "원혜영",
                      "x": -3,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>원혜영 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "이석현",
                      "x": -3,
                      "y": 7,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이석현 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "조정식",
                      "x": -3,
                      "y": 8,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>조정식 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "최동익",
                      "x": -3,
                      "y": 9,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>최동익 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김상민",
                      "x": 3,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김상민 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김태호",
                      "x": 3,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김태호 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "유재중",
                      "x": 3,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>유재중 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "윤상현",
                      "x": 3,
                      "y": 4,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>윤상현 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "중도"
                    },
                    {
                      "name": "이군현",
                      "x": 3,
                      "y": 5,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이군현 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "정두언",
                      "x": 3,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>정두언 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "정희수",
                      "x": 3,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>정희수 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김성곤",
                      "x": 1,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김성곤 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김용태",
                      "x": 1,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김용태 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "중도"
                    },
                    {
                      "name": "우윤근",
                      "x": 1,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>우윤근 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "김영주(더)",
                      "x": -6,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김영주(더) 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "노영민",
                      "x": -6,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>노영민 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "문병호",
                      "x": -6,
                      "y": 3,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>문병호 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "진보"
                    },
                    {
                      "name": "박수현",
                      "x": -6,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박수현 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "박혜자",
                      "x": -6,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박혜자 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "송호창",
                      "x": -6,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>송호창 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "안민석",
                      "x": -6,
                      "y": 7,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>안민석 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "오영식",
                      "x": -6,
                      "y": 8,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>오영식 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "윤호중",
                      "x": -6,
                      "y": 9,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>윤호중 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "이춘석",
                      "x": -6,
                      "y": 10,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이춘석 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "최규성",
                      "x": -6,
                      "y": 11,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>최규성 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "최민희",
                      "x": -6,
                      "y": 12,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>최민희 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "최재천",
                      "x": -6,
                      "y": 13,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>최재천 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "진보"
                    },
                    {
                      "name": "김재원",
                      "x": 7,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김재원 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김태환",
                      "x": 7,
                      "y": 2,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>김태환 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "보수"
                    },
                    {
                      "name": "노철래",
                      "x": 7,
                      "y": 3,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>노철래 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "민현주",
                      "x": 7,
                      "y": 4,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>민현주 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "박대동",
                      "x": 7,
                      "y": 5,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>박대동 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "안효대",
                      "x": 7,
                      "y": 6,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>안효대 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "유기준",
                      "x": 7,
                      "y": 7,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>유기준 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이자스민",
                      "x": 7,
                      "y": 8,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이자스민 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "이재영(비례)",
                      "x": 7,
                      "y": 9,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이재영(비례) 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "정의화",
                      "x": 7,
                      "y": 10,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>정의화 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "보수"
                    },
                    {
                      "name": "진영",
                      "x": 7,
                      "y": 11,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>진영 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "보수"
                    },
                    {
                      "name": "최경환",
                      "x": 7,
                      "y": 12,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>최경환 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "한선교",
                      "x": 7,
                      "y": 13,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>한선교 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "홍문종",
                      "x": 7,
                      "y": 14,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>홍문종 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "황우여",
                      "x": 7,
                      "y": 15,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>황우여 의원</td></tr><tr><td>표결성향: 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "보수"
                    },
                    {
                      "name": "김제남",
                      "x": -12,
                      "y": 1,
                      "tooltip": "<table><tr><td>정의당</td></tr><tr><td>김제남 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#FFCA08",
                      "groups": "정의당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "유대운",
                      "x": -12,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>유대운 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "김진태",
                      "x": 13,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>김진태 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "한기호",
                      "x": 13,
                      "y": 2,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>한기호 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    },
                    {
                      "name": "김현미",
                      "x": -5,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>김현미 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "노웅래",
                      "x": -5,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>노웅래 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "민병두",
                      "x": -5,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>민병두 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "박병석",
                      "x": -5,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박병석 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "백재현",
                      "x": -5,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>백재현 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "신계륜",
                      "x": -5,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>신계륜 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "심재권",
                      "x": -5,
                      "y": 7,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>심재권 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "안규백",
                      "x": -5,
                      "y": 8,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>안규백 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "유성엽",
                      "x": -5,
                      "y": 9,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>유성엽 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "진보"
                    },
                    {
                      "name": "유인태",
                      "x": -5,
                      "y": 10,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>유인태 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "정세균",
                      "x": -5,
                      "y": 11,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>정세균 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "추미애",
                      "x": -5,
                      "y": 12,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>추미애 의원</td></tr><tr><td>표결성향: 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "진보"
                    },
                    {
                      "name": "문희상",
                      "x": -1,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>문희상 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "이원욱",
                      "x": -1,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이원욱 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "이윤석",
                      "x": -1,
                      "y": 3,
                      "tooltip": "<table><tr><td>기독자유당</td></tr><tr><td>이윤석 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#FF0000",
                      "groups": "기독자유당",
                      "econstring": "중도"
                    },
                    {
                      "name": "이해찬",
                      "x": -1,
                      "y": 4,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>이해찬 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "중도"
                    },
                    {
                      "name": "민홍철",
                      "x": -2,
                      "y": 1,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>민홍철 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "박기춘",
                      "x": -2,
                      "y": 2,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>박기춘 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "중도"
                    },
                    {
                      "name": "박주선",
                      "x": -2,
                      "y": 3,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>박주선 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "백군기",
                      "x": -2,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>백군기 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "신기남",
                      "x": -2,
                      "y": 5,
                      "tooltip": "<table><tr><td>민주당</td></tr><tr><td>신기남 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1D4B7E",
                      "groups": "민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "이상민",
                      "x": -2,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>이상민 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "임내현",
                      "x": -2,
                      "y": 7,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>임내현 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "장병완",
                      "x": -2,
                      "y": 8,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>장병완 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "정성호",
                      "x": -2,
                      "y": 9,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>정성호 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "박원석",
                      "x": -11,
                      "y": 1,
                      "tooltip": "<table><tr><td>정의당</td></tr><tr><td>박원석 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#FFCA08",
                      "groups": "정의당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "박홍근",
                      "x": -11,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>박홍근 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "유은혜",
                      "x": -11,
                      "y": 3,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>유은혜 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "윤후덕",
                      "x": -11,
                      "y": 4,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>윤후덕 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "인재근",
                      "x": -11,
                      "y": 5,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>인재근 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "임수경",
                      "x": -11,
                      "y": 6,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>임수경 의원</td></tr><tr><td>표결성향: 매우 진보</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "매우 진보"
                    },
                    {
                      "name": "부좌현",
                      "x": 0,
                      "y": 1,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>부좌현 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "전병헌",
                      "x": 0,
                      "y": 2,
                      "tooltip": "<table><tr><td>더불어민주당</td></tr><tr><td>전병헌 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#1F3895",
                      "groups": "더불어민주당",
                      "econstring": "중도"
                    },
                    {
                      "name": "황주홍",
                      "x": 0,
                      "y": 3,
                      "tooltip": "<table><tr><td>국민의당</td></tr><tr><td>황주홍 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "#6A9E30",
                      "groups": "국민의당",
                      "econstring": "중도"
                    },
                    {
                      "name": "이재오",
                      "x": 2,
                      "y": 1,
                      "tooltip": "<table><tr><td>무소속</td></tr><tr><td>이재오 의원</td></tr><tr><td>표결성향: 중도</td></tr></table>",
                      "color": "gray",
                      "groups": "무소속",
                      "econstring": "중도"
                    },
                    {
                      "name": "이종진",
                      "x": 14,
                      "y": 1,
                      "tooltip": "<table><tr><td>새누리당</td></tr><tr><td>이종진 의원</td></tr><tr><td>표결성향: 매우 보수</td></tr></table>",
                      "color": "#C01921",
                      "groups": "새누리당",
                      "econstring": "매우 보수"
                    }
                  ];

// Translate economic score into word
function translateEconomicScore(economicScore) {
  if (economicScore < -9) {
    return '매우 진보';
  } else if (economicScore < -4) {
    return '진보';
  } else if (economicScore <= 4) {
    return '중도';
  } else if (economicScore <= 9 ) {
    return '보수';
  } else {
    return '매우 보수';
  }
}

// Translate similarity into word
function translateSimilarity(similarity) {
  if (similarity >= 80) {
    return '매우 가까운 편';
  } else if (similarity >= 60) {
    return '가까운 편';
  } else if (similarity >= 40) {
    return '가깝지도 멀지도 않은 편';
  } else if (similarity >= 20) {
    return '먼 편';
  } else {
    return '매우 먼 편';
  }
}

// Fill out report card row
$(document).on('show.bs.collapse', '#answer-table .panel-collapse', function() {
  $('#loading-icon').removeClass('hidden');

  var $answerTableRow = $(this);
  $answerTableRow.find('.choice-voters').html('');

  // Set authentication token at HTTP header
  setAuthToken();

  $.ajax({
    url: '/api/records/' + parseInt($answerTableRow.attr('data-question-id'))  + '/',
    type: 'GET',
  }).done(function(data) {
    data.forEach(function(record, index) {
      if (record.name == $('.search__target').text() || record.name == '나') {
        $('.choice-voters[data-choice-id="' + record.choice_id + '"]').append('<span class="label" ' +
          'style="background-color: ' + record.color + ';">' + record.name + '</span>');
      }
    });
  }).always(function() {
    $('#loading-icon').addClass('hidden');
  });
});

// Update result to public 
$(document).on('click', '.share-btn', function() {
  var formData = new FormData();
  formData.append('is_public', true);

  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();

  $.ajax({
    url: '/api/results/' + resultID + '/',
    type: 'PATCH',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
  });
});

// Search and compare with specific national assembly member
$(document).on('submit', '.search__form', function() {
  event.preventDefault();

  // Initialize search result
  $('.search__target, .search__position, .search__similarity').text('');
  $('.search__exception').removeClass('hidden');
  $('.search__warning-message, .search__danger-message').addClass('hidden');

  // Find target
  var targetName = $('#target-name').val();
  var matchingRow = _.find(rows, {'name': targetName});

  // When searching target does not exist
  if (matchingRow === undefined || targetName == '나') $('.search__danger-message').removeClass('hidden');
  else {
    $('.search__target').text(targetName);
    if (nameListForEconomicScoreException.indexOf(targetName) > -1) $('.search__exception').addClass('hidden');
    $('.search__position').text(translateEconomicScore(matchingRow.economic_score));
    $('.search__similarity').text(translateSimilarity(matchingRow.similarity));
  }

  // Update answer table if row is already opened
  var $answerTableRow = $('#answer-table .collapse.in');
  if (!isNaN(parseInt($answerTableRow.attr('data-question-id')))) {
    $answerTableRow.find('.choice-voters').html('');

    // Set authentication token at HTTP header
    setAuthToken();

    $.ajax({
      url: '/api/records/' + parseInt($answerTableRow.attr('data-question-id'))  + '/',
      type: 'GET',
    }).done(function(data) {
      data.forEach(function(record, index) {
        if (record.name == $('.search__target').text() || record.name == '나') {
          $('.choice-voters[data-choice-id="' + record.choice_id + '"]').append('<span class="label" ' +
            'style="background-color: ' + record.color + ';">' + record.name + '</span>');
        }
      });
    });
  }
});

// Load user data when DOM ready to boost up
$(document).ready(function() {

  if (localStorage.getItem('token') != null || localStorage.getItem('user_id') != null) {
    // Set authentication token at HTTP header
    setAuthToken();
  }

  // Get result object (One dimensional analysis)
  $.ajax({
    url: '/api/results/' + resultID + '/',
    type: 'GET'
  }).done(function(data) {

    // / When user is not an owner of result
    if (data.user != localStorage.getItem('user_id')) $('#go-to-survey-landding-page-btn').text('나도 해보기');

    // Parse record as JSON format 
    rows = JSON.parse(data.record.replace(/'/g, '"'));

    // Reordering in descending order
    rows = _.orderBy(rows, 'similarity', 'desc');

    // Get mine, best and worst matching targets
    var mine = rows[0];
    var bestMatchingTarget = rows[1];
    var worstMatchingTarget = rows[rows.length - 1];

    // Fill out result summary
    $('.summary__position').text(translateEconomicScore(mine.economic_score));
    $('.summary__best-matching-target').text(bestMatchingTarget.name);
    $('.summary__worst-matching-target').text(worstMatchingTarget.name);

    staticData.push({
      'name': '나',
      'x': mine.economic_score,
      'y': -1,
      'tooltip': '<table><tr><td>무소속</td></tr><tr><td>나</td></tr><tr><td>표결성향: ' + translateEconomicScore(mine.economic_score) + '</td></tr></table>',
      'color': '#000000',
      'groups': '무소속',
      'econstring': translateEconomicScore(mine.economic_score) 
    });
  }).fail(function() {
    // When result is not exist or updated to non-public
    $('.result__alert-message').removeClass('hidden');
  });
});

$(window).load(function() {

  // Fill out answer table
  $.ajax({
    url: '/api/questions/',
    type: 'GET',
    data: {
      'survey_id': surveyID
    }
  }).done(function(data) {

    data.forEach(function(question, index) {
      var questionIndex = index + 1;
      var $answerTableRow = $('#answer-table__virtual-dom').clone().removeClass('hidden').removeAttr('id');
      $answerTableRow.find('.panel-heading').attr('href', '#Q' + questionIndex).
          html('#' + questionIndex + ' ' +  question.subtitle);
      $answerTableRow.find('.panel-collapse').attr({
        'id': 'Q' + questionIndex, 
        'data-question-id': question.id
      });

      var choices = question.choices;
      choices.forEach(function(choice, index) {
        $answerTableRow.find('.panel-body').append('<p>' + choice.context +
          ' : <span class="choice-voters" data-choice-id="' + choice.id + '"></span></p>');
      });

      $('#answer-table').append($answerTableRow);
    });

    $('#answer-table__virtual-dom').remove();
  });

  // Draw scatter chart with static data and user data
  window.PykChartsInit = function (e) {
    var k = new PykCharts.multiD.scatter({
      "mode": "default",
      "selector": "#result-chart",
      "data": staticData,

      // Chart Size Parameters
      "chart_width":  640,
      "chart_height": 800,
      "chart_margin_left": 30,
      "chart_margin_right": 0,
      "chart_margin_top": -10,
      "chart_margin_bottom": 80,

      //Chart color parameters
      "color_mode": "color",

      //X-Axis parameters
      "axis_x_enable": "yes",
      "axis_x_title": "국회의원의 경제 표결 성향",
      "axis_x_title_size": 20,
      "axis_x_position": "bottom",
      "axis_x_pointer_position": "bottom",
      "axis_x_line_color": "#1D1D1D",
      "axis_x_pointer_size": 20,
      "axis_x_pointer_color": "#1D1D1D",
      "axis_x_no_of_axis_value": 15,
      "axis_x_pointer_padding": 10,
      "axis_x_outer_pointer_length": 0,
      "axis_x_pointer_values": [-14,-9,-4,4,9,14],
      "axis_x_time_value_datatype": "",
      "axis_x_time_value_interval": 0,
      //Y-Axis parameters
      "axis_y_enable": "yes",
      "axis_y_title": "각 성향 별 의원의 수",
      "axis_y_title_size": 20,
      "axis_y_position": "left",
      "axis_y_pointer_position": "right",
      "axis_y_line_color": "#1D1D1D",
      "axis_y_pointer_size": 20,
      "axis_y_pointer_color": "#1D1D1D",
      "axis_y_no_of_axis_value": 20,
      "axis_y_pointer_padding": 10,
      "axis_y_pointer_values": [1,5,10,15,20,23],
      "axis_y_outer_pointer_length": 20,
      "axis_y_time_value_datatype": "",
      "axis_y_time_value_interval": 0,
      //Chart labels parameters
      "label_size": 100,
      "label_weight": "normal",
      "label_family": "Helvetica Neue,Helvetica,Arial,sans-serif",
      //Realtime data parameters
      "real_time_charts_last_updated_at_enable": "no",
      "real_time_charts_refresh_frequency": 0,
      //chart border parameters
      "border_between_chart_elements_thickness": 2,
      "border_between_chart_elements_style": "solid",
      //Chart-interactive parameters
      "chart_onhover_highlight_enable": "yes",
      "tooltip_enable": "yes",
      "transition_duration": 0,
      //Chart legends parameters
      "legends_enable": "yes",
      "legends_text_size": 20,
      "legends_display": "horizontal",
      "legends_text_weight": "normal",
      "legends_text_family": "Helvetica Neue,Helvetica,Arial,sans-serif",
      //Scatter parameters
      "scatterplot_pointer_enable": "no",
      "scatterplot_radius": 8,
      "variable_circle_size_enable": "yes",
      "zoom_enable": "no",
      "pointer_overflow_enable" : "yes",
      "pointer_thickness":4,
      //Credits parameters
      "credit_my_site_name": "P!NG KOREA",
      "credit_my_site_url": "http://pingkorea.com"
    });
    k.execute();
    
    // Adjust x axis title position
    var yPosition = parseInt($('.x-axis-title').attr('y'));
    $('.x-axis-title').attr('y', yPosition - 5);
  }
});
