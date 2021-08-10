var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a = require('querystring'), parseQuery = _a.parse, stringify = _a.stringify;
var url = require('url');
export default function withCacheEffectivePage(handler) {
    return function (_a) {
        var req = _a.req, res = _a.res, _b = _a.options, options = _b === void 0 ? { secondsBeforeRevalidation: 60 * 30 } : _b;
        var queryParams = parseQuery(url.parse(req.url).query);
        var allowedQueryParams = pick(__assign({}, queryParams), options.allowedQueryParams || []);
        var hasForbiddenQueryParams = Object.values(queryParams).length > 0;
        var includesAllowedQueryParam = Object.values(allowedQueryParams).length > 0;
        res.setHeader('Cache-Control', "s-maxage=" + options.secondsBeforeRevalidation + ", stale-while-revalidate");
        res.setHeader('Content-Disposition', 'inline');
        if (includesAllowedQueryParam) {
            var urlWithAllowedQueryParams = makeUrlWithAllowedQueryParams(req.url, allowedQueryParams);
            var hasUrlChanged = urlWithAllowedQueryParams !== req.url;
            if (hasUrlChanged) {
                return redirect(urlWithAllowedQueryParams);
            }
        }
        else if (hasForbiddenQueryParams) {
            return redirect(makeQuerylessUrl(req.url));
        }
        return handler({ req: req, res: res, query: queryParams }).then(function () { return ({ props: {} }); });
    };
}
function pick(obj, props) {
    var picked = {};
    for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
        var prop = props_1[_i];
        if (obj[prop]) {
            picked[prop] = obj[prop];
        }
    }
    return picked;
}
function makeUrlWithAllowedQueryParams(url, queryParams) {
    return makeQuerylessUrl(url) + '?' + stringify(queryParams);
}
function makeQuerylessUrl(url) {
    return url === null || url === void 0 ? void 0 : url.substr(0, url.indexOf('?'));
}
function redirect(url) {
    return {
        redirect: {
            destination: url,
            permanent: true,
        },
    };
}
