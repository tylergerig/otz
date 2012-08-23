$(function() {
    hljs.initHighlightingOnLoad();
    $(".toc").toc({selectors: "h2, h3"});

    if($.fn.noisy) {
        $("body").noisy({
            monochrome: true,
            opacity: 0.06,
            intensity: 10
        });
    };
}());
