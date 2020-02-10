# Typescript- oppsett 


## Last ned repo 

Clone repo

```
git clone --depth=1 http://tfgit/boba/typescript_oppsett.git

```
Slett git mappen.  
Skriv navn til din lokal repo isteden for "minlokalrepo"

```
rm -rf ./minlokalrepo/.git

```





## Konfigurer filene

 **package-lock.json** ,  **package.json**, og **ehrcraft.config.yml** inneholder en del referanser og navn. \
 Konfigurer disse.   
 Ekesmpel på dette ser du under : 

```
  "name": "sykmelding_typescript",     // bytt til ønsket navn
  "version": "1.0.0",                  
  "description": "Form scripts for Sykmelding",   // endre beskrivelse 
  "main": "index.js",
  "scripts": {
    "test": "ts-mocha test/**/*.spec.ts"
  },
  "keywords": [                     // legg til riktige keywords 
    "openEHR",
    "Sykmelding",
    "NAV",
    "Arena"
  ], 
```   

## Før du kan gå i gang

1. Node må være installert. Innstaleres herfra https://nodejs.org/en/
2. Gulp benyttes som byggesystem, og installers som under

```
npm install gulp-cli -g

```

## Get started

Først må du sette opp alle avhengigheter. Det gjøres med følgende enkle kommandoer:

```
npm update

npm update -D

```

## Start gulp og kod i vei

```
gulp
```

Ettehvert som du gjør endringer bygges en Javascript fil som legges i katalogen til EHR Craft


