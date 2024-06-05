document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('printButton').addEventListener('click', function() {
        var printContents = document.querySelector('.print-this-div').innerHTML;
        var oIframe = document.getElementById('ifrmPrint').innerHTML;

        // Open a new window
        var printWindow = window.open('', '_blank');

        // Write the page contents to the new window
        printWindow.document.write('<html><head><title>Print page</title>');

        // Add your styles
        printWindow.document.write('<style>' +
            'body { font-family: system-ui; font-size: 1em; }' +
            ' figure {margin: unset;}' +
            'figure img {max-width: 250px; height: auto;}' +
            '.wrapper { width: fit-content; border: solid 3px #000; padding: 1rem 1.5rem; }' +
            'h3 { color: #282828; font-size: 1rem; }' +
            'p { color: #282828; }' +
            '.table {width: 100%; border-collapse: collapse; border: 1px solid #ccc;}' +
            'th, td {padding: 15px;text-align: left;}' +
            'tr:nth-child(even) {background-color: #f2f2f2;}' +
            '#chart {width:100%; height:610px;}' +
            '#color-bar {width: fit-content;}' +
            '</style>');

        printWindow.document.write('</head><body>');
        printWindow.document.write('<div class="wrapper">' + printContents + '</div>');
        printWindow.document.write('</body></html>');

        printWindow.document.close(); // Document writing finished

        // Call print after a delay
        setTimeout(function() {
            printWindow.print();
        }, 200);
    });
});

