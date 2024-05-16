document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('printButton').addEventListener('click', function() {
        var printContents = document.querySelector('.print-this-div').innerHTML;

        // Open a new window
        var printWindow = window.open('', '_blank');

        // Write the page contents to the new window
        printWindow.document.write('<html><head><title>Name Me Something</title>');

        // Add your styles
        printWindow.document.write('<style>' +
            'body { font-family: system-ui; font-size: 1rem; }' +
            ' figure {margin: unset;}' +
            'figure img {max-width: 250px; height: auto;}' +
            '.wrapper { width: fit-content; border: solid 3px #0067ff; padding: 1rem 1.5rem; }' +
            'h3 { color: #282828; font-size: 1rem; }' +
            'p { color: #282828; }' +
            'table {table {width: 100%; border-collapse: collapse; border: 1px solid #ccc;' +
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