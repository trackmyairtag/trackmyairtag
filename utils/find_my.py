# Read location from Find My app
# HOME / /Library/Caches/com.apple.findmy.fmipcore/Items.data

import os
import json
import itertools
from addict import Dict
import aiofiles, aiofiles.os
import asyncio


class FindMy:
    def __init__(self, path):
        self.path = os.path.expanduser(path)

    @staticmethod
    def is_mac():
        return os.uname().sysname == "Darwin"

    async def get(self):
        if not self.is_mac:
            return []
        data = await self._read_data()
        if data:
            return self._parse_data(data)
        return None

    async def _read_data(self):
        if await aiofiles.os.path.exists(self.path):
            async with aiofiles.open(self.path, mode="r") as f:
                return await f.read()
        return None

    def _parse_data(self, data):
        ret = []
        version = os.path.getmtime(self.path)
        for i in json.loads(data):
            i = Dict(i)
            id = i.identifier or i.deviceDiscoveryId
            if i.location is not None:
                image = i.productType.productInformation.defaultListIcon2x
                if not image:
                    model = i.rawDeviceModel.replace('_', ',')
                    image = f'https://statici.icloud.com/fmipmobile/deviceImages-9.0/{i.deviceClass}/{model}/online-sourcelist.png'

                row = Dict()
                row.id = id
                row.name = i.name
                row.address = i.address.mapItemFullAddress if i.address else None
                row.image = image
                row.timestamp = i.location.timeStamp / 1000
                row.latitude = i.location.latitude
                row.longitude = i.location.longitude
                row.altitude = i.location.altitude
                row.raw = i
                ret.append(row)
        return ret


class FindMyItems(FindMy):
    def __init__(self, path):
        super().__init__(path=path)
        self.path = os.path.join(self.path, "Items.data")


class FindMyDevices(FindMy):
    def __init__(self, path):
        super().__init__(path=path)
        self.path = os.path.join(self.path, "Devices.data")


if __name__ == "__main__":
    from pprint import pprint

    loop = asyncio.get_event_loop()
    pprint(loop.run_until_complete(FindMyItems().get()))
    pprint(loop.run_until_complete(FindMyDevices().get()))
