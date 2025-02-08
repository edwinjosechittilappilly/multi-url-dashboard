const icongen = require('icon-gen');
const path = require('path');

const options = {
    report: true,
    ico: {
        name: 'icon',
        sizes: [16, 24, 32, 48, 64, 128, 256]
    },
    icns: {
        name: 'icon',
        sizes: [16, 32, 64, 128, 256, 512, 1024]
    },
    png: {
        name: 'icon',
        sizes: [16, 24, 32, 48, 64, 128, 256, 512, 1024]
    }
};

icongen(
    path.resolve(__dirname, '../build/icon.svg'),
    path.resolve(__dirname, '../build'),
    options
)
.then((results) => {
    console.log('Icons generated successfully!');
    console.log(results);
})
.catch((error) => {
    console.error('Error generating icons:', error);
    process.exit(1);
}); 