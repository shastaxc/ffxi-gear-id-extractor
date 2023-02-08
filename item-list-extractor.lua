_addon.name = 'ItemListExtractor'
_addon.author = 'Shasta'
_addon.version = '1.0.0'
_addon.commands = {'ile','itemlistextractor'}

require('sets')
require('tables')
require('logger')
require('strings')
res = require('resources')
jsonlib = require('jsonlib')

chat_purple = string.char(0x1F, 200)
chat_grey = string.char(0x1F, 160)
chat_red = string.char(0x1F, 167)
chat_white = string.char(0x1F, 001)
chat_green = string.char(0x1F, 214)
chat_yellow = string.char(0x1F, 036)
chat_d_blue = string.char(0x1F, 207)
chat_pink = string.char(0x1E, 5)
chat_l_blue = string.char(0x1E, 6)

function get_items_map()
  local categories = S{'Weapon', 'Armor'}
  local items = res.items:category(set.contains+{categories})

  -- Rekey table to use name instead of ID for keys.
  -- De-duplicate items by name by keeping the one with highest ID. This can happen if an item can
  -- evolve/upgrade but retain the same name (e.g. REMA upgrades)
  local uber_table = {}
  local prev_id
  for id,item in pairs(items) do
    if prev_id and prev_id ~= item.id-1 then
      print('table is not processed sequentially')
    end
    uber_table[item.en:lower()] = {en=item.en, enl=item.enl, id=item.id}
    if item.en:lower() ~= item.enl:lower() then
      uber_table[item.enl:lower()] = {en=item.en, enl=item.enl, id=item.id}
    end
  end

  -- Game crashes if trying to encode the whole table at once, so save as multiple tables
  local gear_tables = {}
  local chunk_size = 1000
  local total_len = 0
  local len = 0
  local i = 1
  for name,item in pairs(uber_table) do
    if not gear_tables[i] then gear_tables[i] = {} end
    gear_tables[i][name] = {en=item.en, enl=item.enl, id=item.id}
    total_len = total_len + 1
    len = len + 1
    if len == chunk_size then
      i = i + 1
      len = 0
    end
  end

  windower.add_to_chat(001, 'Finished chunking '..total_len..' items into '..table.length(gear_tables)..' chunks.')
  return gear_tables
end

-- Convert to JSON
function save_table_as_json(t)
  local f = io.open(windower.addon_path..'data/items.'..os.time(os.date("!*t"))..'.json','w+b')
  if not f then
    print('Cannot open/create file data/items.lua')
    return
  end

  windower.add_to_chat(001, 'Start encoding table as JSON...')

  local total_chunks = table.length(t)

  -- Encode each table as a JSON string
  for i,chunk in ipairs(t) do
    local json_str = jsonlib.encode(chunk)
    -- Remove opening bracket unless first chunk
    if i > 1 then
      json_str = json_str:sub(2)
    end
    -- Replace closing bracket with comma unless last chunk
    if i < total_chunks then
      json_str = json_str:sub(1, json_str:len() - 1)
      json_str = json_str..','
    end
    f:write(json_str)
  end

  windower.add_to_chat(001, 'Finished encoding table as JSON!')
  f:close()
end

windower.register_event('addon command', function(cmd, ...)
  cmd = cmd and cmd:lower()
  local args = {...}
  -- Force all args to lowercase
  for k,v in ipairs(args) do
    args[k] = v:lower()
  end

  if cmd then
    if S{'reload', 'r'}:contains(cmd) then
      windower.send_command('lua r item-list-extractor')
      windower.add_to_chat(001, chat_d_blue..'Item List Extractor: Reloading.')
    elseif 'extract' == cmd then
      local gear_tables = get_items_map()
      save_table_as_json(gear_tables)
      windower.add_to_chat(001, 'Extraction complete!')
    end
  end
end)
