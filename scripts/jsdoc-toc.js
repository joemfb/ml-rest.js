(function($) {
    // TODO: make the node ID configurable
    var treeNode = $('#jsdoc-toc-nav');

    // initialize the tree
    treeNode.tree({
        autoEscape: false,
        closedIcon: '&#x21e2;',
        data: [{"label":"<a href=\"global.html\">Globals</a>","id":"global","children":[]},{"label":"<a href=\"MLRest.html\">MLRest</a>","id":"MLRest","children":[{"label":"<a href=\"MLRest.Database.html\">Database</a>","id":"MLRest.Database","children":[]},{"label":"<a href=\"MLRest.Transaction.html\">Transaction</a>","id":"MLRest.Transaction","children":[]}]},{"label":"<a href=\"deps.html\">deps</a>","id":"deps","children":[{"label":"<a href=\"deps.external_Headers.html\">Headers</a>","id":"deps.external:Headers","children":[]},{"label":"<a href=\"deps.external_Promise.html\">Promise</a>","id":"deps.external:Promise","children":[]},{"label":"<a href=\"deps.external_Response.html\">Response</a>","id":"deps.external:Response","children":[]},{"label":"<a href=\"deps.external_URL.html\">URL</a>","id":"deps.external:URL","children":[]},{"label":"<a href=\"deps.external_URLSearchParams.html\">URLSearchParams</a>","id":"deps.external:URLSearchParams","children":[]},{"label":"<a href=\"deps.external_fetch.html\">fetch</a>","id":"deps.external:fetch","children":[]}]}],
        openedIcon: ' &#x21e3;',
        saveState: true,
        useContextMenu: false
    });

    // add event handlers
    // TODO
})(jQuery);
