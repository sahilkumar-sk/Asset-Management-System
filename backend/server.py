from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse
from router import Router
from http_helpers import send_json, read_json
from repositories import users, locations, assets, employees
from services import dashboard

router = Router()

# ---- route registrations ----
router.add('GET',  r'/',                      lambda h,g: send_json(h,200,{'status':'success','message':'AMS backend is running'}))
router.add('GET',  r'/dashboard/summary',     lambda h,g: send_json(h,200,{'status':'success','data':dashboard.summary()}))
router.add('GET',  r'/dashboard/by-category', lambda h,g: send_json(h,200,{'status':'success','data':dashboard.by_category()}))

# Locations
def get_locations(h, g):       send_json(h,200,{'status':'success','data':locations.list_locations()})
def get_location(h, g):
    loc = locations.get_location(int(g[0])); 
    send_json(h,200,{'status':'success','data':loc}) if loc else send_json(h,404,{'status':'error','message':'Location not found'})
def post_location(h, g):
    data = read_json(h); name = (data.get('name') or '').strip()
    if not name: return send_json(h,400,{'status':'error','message':'Name is required.'})
    row = locations.create_location(name, data.get('address'), data.get('floor'), data.get('room'))
    send_json(h,201,{'status':'success','message':'Location added successfully.','data':row})
def put_location(h, g):
    data = read_json(h); ok = locations.update_location(int(g[0]), {k:v for k,v in data.items() if v is not None})
    send_json(h,200,{'status':'success','message':'Location updated.'}) if ok else send_json(h,404,{'status':'error','message':'Location not found'})
def del_location(h, g):
    ok = locations.delete_location(int(g[0]))
    send_json(h,200,{'status':'success','message':'Location deleted.'}) if ok else send_json(h,404,{'status':'error','message':'Location not found'})

router.add('GET',    r'/locations',          get_locations)
router.add('GET',    r'/locations/(\d+)',    get_location)
router.add('POST',   r'/locations',          post_location)
router.add('PUT',    r'/locations/(\d+)',    put_location)
router.add('DELETE', r'/locations/(\d+)',    del_location)

# ---------- ASSETS ----------
def get_assets(h, g):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(h.path).query)
    status = q.get('status', [''])[0] or None
    location_id = q.get('location_id', [''])[0] or None
    data = assets.list_assets(status=status, location_id=location_id)
    send_json(h, 200, {'status':'success','data':data})

def get_asset(h, g):
    row = assets.get_asset(int(g[0]))
    return send_json(h,200,{'status':'success','data':row}) if row else send_json(h,404,{'status':'error','message':'Asset not found'})

def post_asset(h, g):
    d = read_json(h)
    name     = (d.get('name') or '').strip()
    category = (d.get('category') or '').strip()
    if not name or not category:
        return send_json(h,400,{'status':'error','message':'Name and category are required.'})
    row = assets.create_asset(
        name=name,
        category=category,
        purchase_date=d.get('purchase_date'),
        cost=d.get('cost'),
        status=d.get('status','available'),
        serial_no=d.get('serial_no'),
        notes=d.get('notes'),
        location_id=d.get('location_id'),
        assigned_to=d.get('assigned_to')
    )
    send_json(h,201,{'status':'success','message':'Asset added successfully.','data':row})

def put_asset(h, g):
    d = read_json(h)
    ok = assets.update_asset(int(g[0]), {k:v for k,v in d.items() if v is not None})
    send_json(h,200,{'status':'success','message':'Asset updated.'}) if ok else send_json(h,404,{'status':'error','message':'Asset not found'})

def del_asset(h, g):
    ok = assets.delete_asset(int(g[0]))
    send_json(h,200,{'status':'success','message':'Asset deleted.'}) if ok else send_json(h,404,{'status':'error','message':'Asset not found'})

router.add('GET',    r'/assets',        get_assets)
router.add('GET',    r'/assets/(\d+)',  get_asset)
router.add('POST',   r'/assets',        post_asset)
router.add('PUT',    r'/assets/(\d+)',  put_asset)
router.add('DELETE', r'/assets/(\d+)',  del_asset)

# ---------- EMPLOYEES ----------
def get_employees(h, g):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(h.path).query)
    department  = q.get('department', [''])[0] or None
    location_id = q.get('location_id', [''])[0] or None
    status      = q.get('status', [''])[0] or None
    data = employees.list_employees(department=department, location_id=location_id, status=status)
    send_json(h,200,{'status':'success','data':data})

def get_employee(h, g):
    row = employees.get_employee(int(g[0]))
    return send_json(h,200,{'status':'success','data':row}) if row else send_json(h,404,{'status':'error','message':'Employee not found'})

def post_employee(h, g):
    d = read_json(h)
    name = (d.get('name') or '').strip()
    if not name:
        return send_json(h,400,{'status':'error','message':'Name is required.'})
    row = employees.create_employee(
        name=name,
        department=d.get('department'),
        location_id=d.get('location_id'),
        status=d.get('status','active'),
        email=d.get('email'),
        phone=d.get('phone')
    )
    send_json(h,201,{'status':'success','message':'Employee added successfully.','data':row})

def put_employee(h, g):
    d = read_json(h)
    ok = employees.update_employee(int(g[0]), {k:v for k,v in d.items() if v is not None})
    send_json(h,200,{'status':'success','message':'Employee updated.'}) if ok else send_json(h,404,{'status':'error','message':'Employee not found'})

def del_employee(h, g):
    ok = employees.delete_employee(int(g[0]))
    send_json(h,200,{'status':'success','message':'Employee deleted.'}) if ok else send_json(h,404,{'status':'error','message':'Employee not found'})

router.add('GET',    r'/employees',        get_employees)
router.add('GET',    r'/employees/(\d+)',  get_employee)
router.add('POST',   r'/employees',        post_employee)
router.add('PUT',    r'/employees/(\d+)',  put_employee)
router.add('DELETE', r'/employees/(\d+)',  del_employee)


# Auth
def post_register(h, g):
    d = read_json(h)
    first, last = (d.get('FirstName') or '').strip(), (d.get('LastName') or '').strip()
    email, number = (d.get('Email') or '').strip(), (d.get('number') or '').strip()
    pw1, pw2 = d.get('new_password') or '', d.get('re_password') or ''
    if not all([first,last,email,pw1,pw2]): return send_json(h,400,{'status':'error','message':'All fields are required.'})
    if pw1 != pw2: return send_json(h,400,{'status':'error','message':'Passwords do not match.'})
    try:
        users.create_user(first,last,email,number,pw1)
        send_json(h,201,{'status':'success','message':'User registered successfully!'})
    except Exception as e:
        send_json(h,409,{'status':'error','message':'Email already exists.'})

def post_login(h, g):
    d = read_json(h); email = (d.get('Email') or '').strip(); pw = d.get('password') or ''
    if not email or not pw: return send_json(h,400,{'status':'error','message':'Email and password required.'})
    ok = users.check_login(email,pw)
    send_json(h,200,{'status':'success','message':'Login successful!'}) if ok else send_json(h,401,{'status':'error','message':'Invalid credentials'})

router.add('POST', r'/register', post_register)
router.add('POST', r'/login',    post_login)

# ---- HTTP handler ----
class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        send_json(self, 200, {'ok': True})

    def do_GET(self):    self._dispatch('GET')
    def do_POST(self):   self._dispatch('POST')
    def do_PUT(self):    self._dispatch('PUT')
    def do_DELETE(self): self._dispatch('DELETE')

    def _dispatch(self, method):
        path = urllib.parse.urlparse(self.path).path
        func, groups = router.match(method, path)
        if func:
            try:
                func(self, groups)
            except Exception as e:
                send_json(self, 500, {'status':'error','message':f'Server Error: {e}'})
        else:
            send_json(self, 404, {'status':'error','message':'Not found'})

if __name__ == '__main__':
    from db import DB_PATH
    import webbrowser, os

    FRONTEND_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dashboard.html')
    FRONTEND_URL = f'file:///{os.path.abspath(FRONTEND_PATH)}'.replace('\\', '/')

    print("✅ AMS backend running at http://localhost:8000")
    print("📂 Database:", DB_PATH)
    print("🌐 Opening AMS Dashboard...")

    # Launch frontend automatically
    webbrowser.open(FRONTEND_URL)

    srv = HTTPServer(('', 8000), Handler)
    srv.serve_forever()
