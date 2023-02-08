_addon.name = 'ItemListExtractor'
_addon.author = 'Shasta'
_addon.version = '1.0.0'
_addon.commands = {'ile','itemlistextractor'}

local http = require('ssl.https')
local ltn12 = require('ltn12')
require('sets')
require('logger')

-- 1. Download file
function download_map()
  -- Open a file to save content
  local f = io.open(windower.addon_path..'data/items.lua','w+b')
  if not f then
    print('Cannot open/create file data/items.lua')
    return
  end
  
  local output_sink = ltn12.sink.file(f)

  -- Retrieve the content of a URL
  local body, code, headers = http.request({
    method = "GET",
    url = 'https://raw.githubusercontent.com/Windower/Resources/master/resources_data/items.lua',
    headers = {
      ['Host'] = 'raw.githubusercontent.com',
      ['User-Agent'] = 'Item Extractor Windower Addon',
      ['Accept'] = '*/*',
      ['Accept-Encoding'] = 'gzip, deflate, br',
      ['Accept-Language'] = 'en-US,en;q=0.5',
      ['Cache-Control'] = 'no-cache',
    },
    sink = progress_sink(output_sink)
  })
  windower.add_to_chat(001, 'body: '..(body or ''))
  windower.add_to_chat(001, 'code: '..(code or ''))
  table.vprint(headers)
end

-- this function creates a sink that forwards the downloaded chunk to another sink
function progress_sink(output_sink)
  -- this function is the actual sink
  return function(chunk, err)
    if not chunk then
      -- if chunk is nil, then the download is finished, or we have an error
      if err then
        print(err)
      else
        print("Download finished")
      end
    end

    -- forward chunk and err to the underlying sink
    return output_sink(chunk, err)
  end
end

-- 2. Injest as lua table

-- 3. Transform table

-- 4. Convert to JSON


windower.register_event('addon command', function(cmd, ...)
  cmd = cmd and cmd:lower()
  local args = {...}
  -- Force all args to lowercase
  for k,v in ipairs(args) do
    args[k] = v:lower()
  end

  if cmd then
    if S{'reload', 'r'}:contains(cmd) then
      windower.send_command('lua r ffxi-gear-id-extractor')
      windower.add_to_chat(001, chat_d_blue..'Item List Extractor: Reloading.')
    elseif 'download' == cmd then
      download_map()
    end
  end
end)

chat_purple = string.char(0x1F, 200)
chat_grey = string.char(0x1F, 160)
chat_red = string.char(0x1F, 167)
chat_white = string.char(0x1F, 001)
chat_green = string.char(0x1F, 214)
chat_yellow = string.char(0x1F, 036)
chat_d_blue = string.char(0x1F, 207)
chat_pink = string.char(0x1E, 5)
chat_l_blue = string.char(0x1E, 6)
