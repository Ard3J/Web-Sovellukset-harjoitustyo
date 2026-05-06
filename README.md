# Web-Sovellukset-harjoitustyo

This repository contains the project work for course Web sovellusten perusteet. It uses the [TheMealDB](https://www.themealdb.com) to find recipes using it's [API](https://www.themealdb.com/api.php).

Page provides meals with ingredients and recipes, either randomly or filtering through ingredients given by user. Either any recipe containing given ingredients, or given ingredients plus few extras, number of which user can choose. Some basic ingredients(water, salt, pepper, sugar, oil) are always included and not counted as extras, to make searching easier. 

To run this project, download the files and create in /js folder file config.js with following content:

const CONFIG = {
    API_KEY: "YOUR_API_KEY"
}

And put your API key there. Then running in VSCode with Live Server extension and it should work.
