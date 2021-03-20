var express = require('express');
var router = express.Router();
var axios = require('axios')

var prefixes = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX noInferences: <http://www.ontotext.com/explicit>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX : <http://www.daml.org/2003/01/periodictable/PeriodicTable#>
    `
 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


/* GET all elements from  periodic table. */
router.get('/periodictable/elements', function(req, res, next) {

  var query = `select ?symbol ?name  where { 
                    ?s a :Element ;
                        :atomicNumber ?anumber;
                        :name			?name ;
                        :symbol		?symbol.
                  } 
                  order by asc(?anumber)
                  `

  var getLink = "http://localhost:7200/repositories/tabelaPeriodica"+"?query=" 
  var encoded = encodeURIComponent(prefixes + query)
 
  axios.get(getLink + encoded)
    .then(dados =>{
          var e = dados.data.results.bindings.map(bind => 
            {
                  return ({
                   symbol  :bind.symbol.value,
                   name: bind.name.value 
                })
           })
                    
        res.render('elements', { elements: e });

    })
    .catch(erro => console.log(erro))
  
});






/* GET all the info about an element. */
router.get('/periodictable/element/:id', function(req, res, next) {
  var name= req.params.id ;
  var query = `select * where {
    
    ?s a :Element ;
     :symbol ?symbol;
     :name   ?name;
     :atomicNumber ?anumber;
     :group		?group;
     :period		?period;
     :standardState ?sstate;
     :symbol	"${name}".

   Optional{   
     ?s a :Element ;
     :atomicWeight ?aweight;
     :color			?color;
     :classification	?classification.
    }
}		

                  `

  var getLink = "http://localhost:7200/repositories/tabelaPeriodica"+"?query=" 
  var encoded = encodeURIComponent(prefixes + query)
 
  axios.get(getLink + encoded)
    .then(dados =>{
        console.dir(dados.data.results.bindings)          

          var e = dados.data.results.bindings.map(bind => 
            {
                var aweight;
                var color;
                var classification;
                console.log("ESTOU AQUI")

                if(!bind.aweight || !bind.color || !bind.classification){
                  aweight="-";
                  color="-";
                  classification="-";
                }
                else {
                  aweight= bind.aweight.value;
                  color=bind.color.value;
                  classification=bind.classification.value.split("#")[1];

                }
                  
                   return ({
                     Symbol: bind.symbol.value,
                     Name:  bind.name.value,
                     "Atomic Number": bind.anumber.value,
                     "Atomic Weight":aweight,
                     Group:		bind.group.value.split("_")[1],
                     Period:	bind.period.value.split("_")[1],
                     "Standard State": bind.sstate.value,
                     Color:		color,
                     Classification:classification
                })
           })[0]
        
        res.render('element', { element: e });

    })
    .catch(erro => console.log(erro))
  
});


/* GET all the groups . */
router.get('/periodictable/groups/', function(req, res, next) {
  
  var query = `select * where {
    ?s a :Group ;
     :number ?number ;
     :name   ?name .
  }
  order by asc(?number) 
  `
  
  var getLink = "http://localhost:7200/repositories/tabelaPeriodica"+"?query=" 
  var encoded = encodeURIComponent(prefixes + query)
 
  axios.get(getLink + encoded)
    .then(dados =>{
          var g = dados.data.results.bindings.map(bind => 
            {
                  return ({
                     Number: bind.number.value,
                     Name:  bind.name.value,
           
                })
           })
                    
        res.render('groups', { groups: g });

    })
    .catch(erro => console.log(erro))
  
});

/* GET all the elements of the  group X  . */
router.get('/periodictable/group/:id', function(req, res, next) {
  var number = req.params.id;
  var query = `select ?symbol ?name ?number where {
    ?s a :Group ;
      :name ?name;
      :number  ?number;
      :number  ${number}. 
    ?s :element ?symbol .
} 
      `

  var getLink = "http://localhost:7200/repositories/tabelaPeriodica"+"?query=" 
  var encoded = encodeURIComponent(prefixes + query)
 
  axios.get(getLink + encoded)
    .then(dados =>{
          var g = dados.data.results.bindings.map(bind => 
            {
                  return ({
                     Symbol: bind.symbol.value.split("#")[1],
                     Group:  bind.name.value,
                     Number: bind.number.value
                })
           })
                    
        res.render('group', { group: g,name: g[0].Group });

    })
    .catch(erro => console.log(erro))
  
});






/* GET all the periods . */
router.get('/periodictable/periods/', function(req, res, next) {
  
  var query = `select  distinct ?number   where {
    ?s a :Period;
      :number ?number.
      ?s ?p ?o .
      }
      
      order by asc(?number)
  `
  
  var getLink = "http://localhost:7200/repositories/tabelaPeriodica"+"?query=" 
  var encoded = encodeURIComponent(prefixes + query)
 
  axios.get(getLink + encoded)
    .then(dados =>{
          var p = dados.data.results.bindings.map(bind => 
            {
                  return ({
                     Number: bind.number.value,
           
                })
           })
                    
        res.render('periods', { periods: p });

    })
    .catch(erro => console.log(erro))
  
});




/* GET all the elements in certain period . */
router.get('/periodictable/period/:id', function(req, res, next) {
  var number=req.params.id;
  var query = `select  ?element  where {
                       ?s a :Period;
                       :element ?element;
                       :number ${number}.
                }
  `
  
  var getLink = "http://localhost:7200/repositories/tabelaPeriodica"+"?query=" 
  var encoded = encodeURIComponent(prefixes + query)
 
  axios.get(getLink + encoded)
    .then(dados =>{
          var p = dados.data.results.bindings.map(bind => 
            {
                  return ({
                     Symbol: bind.element.value.split("#")[1]
           
                })
           })
                    
        res.render('period', { period: p,number:number });

    })
    .catch(erro => console.log(erro))
  
});

module.exports = router;