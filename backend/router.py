import re

class Router:
    def __init__(self):
        self.routes = []  # (method, regex, handler)

    def add(self, method, pattern, func):
        self.routes.append((method.upper(), re.compile(pattern), func))

    def match(self, method, path):
        method = method.upper()
        for m, regex, func in self.routes:
            if m == method:
                mobj = regex.fullmatch(path)
                if mobj:
                    return func, mobj.groups()
        return None, ()
