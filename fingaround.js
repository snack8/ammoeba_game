(function ( $ ){    // This IIFE gives us access to $ inside plugin

    var testVar = 1;

    $.myFunc = function() {
        alert(privFunc());
    }

    function privFunc() {
	testVar +=1;
	return testVar;
    } 

})( jQuery );       // No more plugin code after this.b