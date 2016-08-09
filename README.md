# Charts

Renders time series as charts for Angular

## Using the library

Install it from npm:

    npm i @rightscale/ui-charts

In your application, import the library in your `index.ts` to make it available globally

    import '@rightscale/ui-charts'

Add a reference to the library's module in the Angular module definition for your app:

    angular.module('myApp', ['rs.charts'])

In your SCSS stylesheet, import the library's stylesheet if present:

    @import '../node_modules/@rightscale/ui-charts/styles.scss';

## Contributing

### Setup

Tested with Node version 5.12.0 You also need Gulp installed.

Install dependencies with

    npm i

### Demo app

You can run the demo app with:

    gulp demo

That will automatically serve the demo app and watch for any changes to the app and the library.

### Running tests

You can run the tests in PhantomJS:

    gulp spec

Or you can run them in Chrome if you wish to debug them:

    gulp spec:debug

### Working with a dependent package

If you're working both on the library and a package that consumes it, you can make your local copy of
the library available:

    npm link

Then you can use this copy from the dependent package using

    npm link @rightscale/ui-charts

Finally, you can watch for file changes in the library so the image and template files are automatically
rebuilt:

    gulp

## Contributors

* André Rieussec (@Ventajou)

## License

MIT (c) RightScale
