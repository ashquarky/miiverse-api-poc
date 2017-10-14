module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "strict",
    "parserOptions": {
        "ecmaVersion": 8,
    },
    "rules": {
        "quotes": [0, "double"],
        "indent": 0,
        "id-blacklist": 0,
        "template-curly-spacing": [2, "never"],
        "newline-per-chained-call": 0,
        "filenames/match-regex": 0,
        "id-length": 0,
        "spaced-comment": 0,
        "class-methods-use-this": 0,
        "max-len": 0,
        //I felt this didn't make sense for readability
        "prefer-destructuring": 0,
        //this one might be better turned on
        "no-sync": 0,
        "require-await": 0,
        "array-element-newline": 0,

        "no-magic-numbers": [1, {"ignore": [-1, 0, 1, 2, 4]}],
        "no-warning-comments": 1,
    }
};
