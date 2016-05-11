var forecastLoader = (function ForecastLoader(){

const dataSample = {
	cityNumber : 0,
	cityName : "nome da cidade",
	datePublished : "datetime String",
	author : "funcionario",
	tempminOculta : "",
	tempmaxOculta : "",

	maximumDay : "hoje ou amanha",
	maximumValue : 100,
	maximumUnity : "kelvin",

	minimumDay : "hoje ou amanha",
	minimumValue : 5,
	minimumUnity : "kelvin",

	relativeHumidityDay : "hoje ou amanha",
	relativeHumidityValue : "0% a 100%",
	relativeHumidityUnity : "%",

	rainDay : "hoje ou amanha",
	rainValue : "Alta fraca",
	rainUnity : "currently nonsense"
}

var xmlDocument;
var forecasts;
var articleSnippet;

function getSnippet(callback) {
	// Network is only used once
	if (articleSnippet != null){
		callback(articleSnippet);
	}

	var link = document.getElementById("link-article-snippet").getAttribute("href");

	var req = new XMLHttpRequest();
	req.onload = function handler() {
	  if(this.responseText != null) {
		// success!
		articleSnippet = (new DOMParser()).parseFromString(
			this.responseText,
			"text/html"
		);
		callback(articleSnippet);
	  } else {
		// something went wrong
		console.log("something went wrong");
		console.log(this);
	  }
	};

	req.open("GET", link);
	req.send(null);
}

function getStuff(callback){
	// Network is only used once
	if (xmlDocument != null){
		callback(xmlDocument);
	}

	var link = document.getElementById("link-rel-cidades").getAttribute("href");

	var req = new XMLHttpRequest();
	req.onload = function handler() {
	  if(this.responseXML != null) {
		// success!
		xmlDocument = this.responseXML;
		callback(xmlDocument);
	  } else {
		// something went wrong
		console.log("something went wrong");
	  }
	};

	req.open("GET", link);
	req.send(null);
}

function extractData(xmlDocument, callback){

	var forecasts = new Array();

	const datePublished = xmlDocument.getElementsByTagName("data")[0].textContent;

	const author = xmlDocument.getElementsByTagName("funcionario")[0].textContent;

	const parametros = xmlDocument.getElementsByTagName('parametros')[0];

	const maximumDay = parametros.getAttribute("tempmax-dia");
	const maximumUnity = parametros.getAttribute("temp-unidade");

	const minimumDay = parametros.getAttribute("tempmin-dia");
	const minimumUnity = maximumUnity;

	const relativeHumidityDay = parametros.getAttribute("ur-dia");
	const relativeHumidityUnity = parametros.getAttribute("ur-unidade");

	const rainDay = parametros.getAttribute("chuva-dia");
	const rainUnity = parametros.getAttribute("chuva-unidade");

	const tempminOculta = parametros.getAttribute("tempmin-oculta");
	const tempmaxOculta = parametros.getAttribute("tempmax-oculta");

	var cidades = xmlDocument.getElementsByTagName("cidade");
	let city, cityNumber, cityName, maximumValue, minimumValue, relativeHumidityValue, rainValue;
	for (let i = 0; i < cidades.length; i++){
		city = cidades.item(i);

		cityNumber = i;
		cityName = city.getAttribute("nome");

		maximumValue = city.getElementsByTagName("temperatura-maxima")[0].textContent;
		minimumValue = city.getElementsByTagName("temperatura-minima")[0].textContent;
		relativeHumidityValue = city.getElementsByTagName("umidade-relativa")[0].textContent;
		rainValue = city.getElementsByTagName("probabilidade-chuva")[0].textContent;

		var cityForecast = {
			cityNumber : cityNumber,
			cityName : cityName,
			datePublished : datePublished,
			author : author,
			tempminOculta : tempminOculta,
			tempmaxOculta : tempmaxOculta,

			maximumDay : maximumDay,
			maximumValue : maximumValue,
			maximumUnity : maximumUnity,

			minimumDay : minimumDay,
			minimumValue : minimumValue,
			minimumUnity : minimumUnity,

			relativeHumidityDay : relativeHumidityDay,
			relativeHumidityValue : relativeHumidityValue,
			relativeHumidityUnity : relativeHumidityUnity,

			rainDay : rainDay,
			rainValue : rainValue,
			rainUnity : rainUnity
		}

		forecasts.push(cityForecast);
	}
	if (callback){
		callback(forecasts);
	}

	return forecasts;
}

function fillArticle(articleSnippet, data, callback) {
	var activeElement;

	activeElement = articleSnippet.getElementById("city-N");
	activeElement.setAttribute("id", "city-" + data.cityNumber);
	activeElement.setAttribute("style", "");

	activeElement = articleSnippet.getElementById("cityName-N");
	activeElement.setAttribute("id", "cityName-" + data.cityNumber);
	activeElement.textContent = data.cityName;

	activeElement = articleSnippet.getElementById("datePublished");
	activeElement.setAttribute("datetime", data.datePublished);
	activeElement.textContent = data.datePublished;

	activeElement = articleSnippet.getElementById("canonicalLink-N");
	activeElement.setAttribute("id", "canonicalLink-" + data.cityNumber);
	activeElement.setAttribute("href", "?city=" + data.cityName);

	var itens = [
		{
			key : "maximum",
			day : data.maximumDay,
			value : data.maximumValue,
			unity : data.maximumUnity
		},
		{
			key : "minimum",
			day : data.minimumDay,
			value : data.minimumValue,
			unity : data.minimumUnity
		},
		{
			key : "relativeHumidity",
			day : data.relativeHumidityDay,
			value : data.relativeHumidityValue,
			unity : data.relativeHumidityUnity
		},
		{
			key : "rain",
			day : data.rainDay,
			value : data.rainValue,
			unity : data.rainUnity
		}
	];

	var elements;
	for (let item of itens){
		activeElement = articleSnippet.getElementById(item.key + "-N");
		activeElement.setAttribute("id", item.key + "-" + data.cityNumber);

		elements = articleSnippet.getElementsByClassName(item.key + "Day");
		for (let i in elements){
			elements[i].textContent = item.day;
		}

		activeElement = articleSnippet.getElementById(item.key + "Value-N");
		activeElement.setAttribute("id", item.key + "Value-" + data.cityNumber);
		activeElement.textContent = item.value;

		elements = articleSnippet.getElementsByClassName(item.key + "Unity");
		for (let i in elements){
			elements[i].textContent = item.unity;
		}
	}

	elements = articleSnippet.getElementsByClassName("author");
	for (let i in elements){
		elements[i].textContent = data.author;
	}

	let pure = articleSnippet.getElementById("city-" + data.cityNumber);
	callback(pure);
}

function createArticle(data, callback){
	getSnippet(	function (articleSnippet) {
		fillArticle(articleSnippet, data, callback);
	});
}

function updateArticleForecast(cityData){
	createArticle(cityData, function (article) {
		let existingArticleDOM = document.getElementById("city-" + cityData.cityNumber);
		if (existingArticleDOM != null){
			existingArticleDOM.outerHTML = article.outerHTML;
		} else {
			document.getElementById("overallForecast").appendChild(article);
		}
	});
}

function canonicalString(input){
	if (!input){
		return input;
	}
	let norm = input.normalize("NFKD").toLowerCase();
	let canonical = "";
	for (let i = 0; norm.codePointAt(i) != null; i++) {
		let l = norm.codePointAt(i);
		if (l < 255){
			canonical += String.fromCodePoint(l);
		}
	}
	return canonical;
}

function updateCity(requestedCityName) {
	var updateIterator = function (forecasts){

		let canonicalCityName = canonicalString(requestedCityName);
		for (let city of forecasts){
			if (canonicalString(city.cityName) == canonicalCityName){
				updateArticleForecast(city);
				return city;
			}
		}
	};

	if (forecasts == null || forecasts.length < 1) {
		getStuff(function (xmlDocument){
			extractData(xmlDocument, updateIterator);
		});
	} else {
		updateIterator(forecasts);
	}
}

function fullUpdate(){
	var updateIterator = function (forecasts){
		for (let city of forecasts){
			updateArticleForecast(city);
		}
	};

	if (forecasts == null || forecasts.length < 1){
		getStuff(function (xmlDocument){
			extractData(xmlDocument, updateIterator);
		});
	} else {
		updateIterator(forecasts);
	}
}

function updateForecasts(callback){
	getStuff(function (xmlDocument){
		forecasts = extractData(xmlDocument);
		callback(forecasts);
	});
}

function getForecasts() {
	return forecasts;
}

return {
	getForecasts : getForecasts,
	updateForecasts : updateForecasts,
	fullUpdate : fullUpdate,
	updateCity : updateCity
}
})();
