const path = require('path')
const { ProvidePlugin, WatchIgnorePlugin } = require('webpack')
const autoprefixer = require('autoprefixer')
const sass = require('sass')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const plugins = [
    new ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        bootstrap: 'bootstrap',
        // Required for more effective component integration
        "window.jQuery": 'jquery',
    }),
    new MiniCssExtractPlugin({
        filename: '[name].css',
    }),
    // When watching, this plugin ensures that only the relevant folders are watched, increasing efficiency of the build
    new WatchIgnorePlugin({
        paths: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'public'),
        ],
    })
];

module.exports = (env) => {
    return {
        mode: env.development ? 'development' : 'production',
        devtool: env.development ? 'source-map' : false,
        entry: {
            site: path.resolve(__dirname, './src/js/site.js'),
            '../css/site': path.resolve(__dirname, './src/css/site.scss'),
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: [/node_modules/, /\.test\.js$/, /test/, /definitions/],
                    use: ['babel-loader']
                },
                {
                    test: /\.tsx?$/,
                    exclude: [/node_modules/, /\.test\.tsx?$/, /test/, /definitions/],
                    use: ['ts-loader']
                },
                {
                    test: /\.(gif|jpg|png|svg|eot|ttf|woff|woff2)$/,
                    type: 'asset',
                },
                {
                    test: /\.(scss|css)$/,
                    exclude: [/node_modules/],
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2,
                                // Include source map for SCSS files for debugging if the environment is set to debug
                                sourceMap: env.development,
                                modules: false,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [autoprefixer],
                                }
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    implementation: sass,
                                    quietDeps: true,
                                }
                            },
                        },
                    ],
                },
            ],
        },

        optimization: {
            minimize: env.development ? false : true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        format: {
                            comments: false,
                        },
                        // As the terser can sometimes shorten class names to contain invalid characters and as the component class uses
                        // the class name within a data attribute to ascertain initialization (`component.js:12), this can cause errors
                        keep_classnames: true,
                        // Include source map for SCSS files for debugging if the environment is set to debug
                        sourceMap: env.development
                    },
                    extractComments: false,
                }),
            ],
        },

        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'public/js'),
            chunkFilename: '[name].[chunkhash].js',
        },

        plugins,

        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            modules: [
                path.resolve(__dirname, 'node_modules'),
            ],
        },
    }
};
