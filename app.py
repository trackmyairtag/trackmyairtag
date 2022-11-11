# aiohttp server
import asyncio
import datetime as dt
import traceback

import asyncpg
from ago import human
from aiohttp import web

from utils.config import DATABASE_DSN, PATH, PORT, REGEX_FILTER
from utils.db import Database
from utils.find_my import FindMyDevices, FindMyItems


async def index(request):
    return web.FileResponse('static/index.html')

async def api_local_get_devices(request):
    return web.json_response(await app['devices'].get())

async def api_local_get_items(request):
    return web.json_response(await app['items'].get())

async def api_db_get_latest(request):
    res = await app['db'].get_latest()
    for row in res:
        row['ago'] = human(dt.datetime.fromtimestamp(row['timestamp']), precision=2)
        row['timestamp'] = dt.datetime.fromtimestamp(row['timestamp']).isoformat()
    return web.json_response(res)

async def update_database(app):
    try:
        while True:
            await asyncio.sleep(10)
            feed = await app['items'].get() + await app['devices'].get()
            for item in feed:
                try:
                    await app['db'].insert(item)
                except asyncpg.exceptions.UniqueViolationError:
                    print('Duplicate', item['id'], item['timestamp'])
                    pass
                except:
                    traceback.print_exc()
    except asyncio.CancelledError:
        print('Background task cancelled')

async def background_tasks(app):
    app['update_database'] = asyncio.create_task(update_database(app))

    yield

    app['update_database'].cancel()
    await app['update_database']

app = web.Application()
app.add_routes([web.get('/', index)])
app.add_routes([web.get('/api/local/devices', api_local_get_devices)])
app.add_routes([web.get('/api/local/items', api_local_get_items)])
app.add_routes([web.get('/api/db/latest', api_db_get_latest)])
app.add_routes([web.static('/static', 'static')])
# add background tasks
app.cleanup_ctx.append(background_tasks)

app['db'] = Database(DATABASE_DSN, REGEX_FILTER)
app['items'] = FindMyItems(path=PATH)
app['devices'] = FindMyDevices(path=PATH)

if __name__ == "__main__":
    web.run_app(app, host='0.0.0.0', port=PORT)
