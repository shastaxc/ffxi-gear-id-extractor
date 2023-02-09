var gearmap;
var slots = {
  '0': 'main',
  '1': 'sub',
  '2': 'range',
  '3': 'ammo',
  '4': 'head',
  '5': 'neck',
  '6': 'ear1',
  '7': 'ear2',
  '8': 'body',
  '9': 'hands',
  '10': 'ring1',
  '11': 'ring2',
  '12': 'back',
  '13': 'waist',
  '14': 'legs',
  '15': 'feet'
}

function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              resolve(document.querySelector(selector));
              observer.disconnect();
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}

function getImg(slotNum, name) {
  var img = document.createElement('img');
  img.width = '32';
  img.height = '32';

  var map_entry

  if (name) {
    map_entry = gearmap[name.toLowerCase()];
    img.src = `https://static.ffxiah.com/images/icon/${map_entry.id}.png`;
  }
  
  if (!name || !map_entry) {
    img.src = `https://static.ffxiah.com/images/eq${slotNum+1}.gif`
  }
  
  if (name) {
    var encName = encodeURIComponent(name.trim().replace(' ', '_'));

    // Put images inside an anchor tag with link to bg wiki
    var anchor = document.createElement('a');
    anchor.href = `https://bg-wiki.com/ffxi/${encName}`;
    anchor.target = '_blank';
    anchor.appendChild(img);
    return anchor;
  }

  return img;
}

function buildGearBox(input) {
  var t = document.createElement('table');
  t.style.display = 'block';
  t.style.margin = '0';
  t.style.border = 'none';
  var tds = [];
  var trs = [];

  trs[0] = document.createElement('tr');
  trs[1] = document.createElement('tr');
  trs[2] = document.createElement('tr');
  trs[3] = document.createElement('tr');

  Object.keys(slots).forEach(function(key,index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object
    var slotName = slots[key];
    tds[key] = document.createElement('td');
    
    tds[key].appendChild(getImg(index, input[slotName]));

    tds[key].width = '32';
    tds[key].height = '32';
    tds[key].style.padding = '0';
    tds[key].style.float = 'left';
    tds[key].style.border = 'none';
    tds[key].style['margin-bottom'] = '1px';
    tds[key].style['margin-right'] = '1px';
    tds[key].style['background-image'] = 'url(http://static.ffxiah.com/images/equip_box.gif)';

    trs[Math.floor(key/4)].appendChild(tds[key]);
  });

  for (var tr of trs) {
    t.appendChild(tr);
  }

  return t;
}

// Wait for contents to exist
waitForElm('.contents').then((elm) => {
  fetch('/items.1675850181.json').then(response => {
    response.json().then(response_value => {
      gearmap = response_value;
      document.querySelectorAll('.gearset').forEach(function(el) {
        var input = {
          title: el.getAttribute('data-title'),
          notes: el.getAttribute('data-notes'),
          main: el.getAttribute('data-main'),
          sub: el.getAttribute('data-sub'),
          range: el.getAttribute('data-range'),
          ammo: el.getAttribute('data-ammo'),
          head: el.getAttribute('data-head'),
          body: el.getAttribute('data-body'),
          hands: el.getAttribute('data-hands'),
          legs: el.getAttribute('data-legs'),
          feet: el.getAttribute('data-feet'),
          neck: el.getAttribute('data-neck'),
          waist: el.getAttribute('data-waist'),
          ear1: el.getAttribute('data-ear1'),
          ear2: el.getAttribute('data-ear2'),
          ring1: el.getAttribute('data-ring1'),
          ring2: el.getAttribute('data-ring2'),
          back: el.getAttribute('data-back'),
        }

        var table = document.createElement('table');
        var row1 = document.createElement('tr');
        var th = document.createElement('th');
        th.setAttribute('colspan', 2);
        th.textContent = input.title;
        row1.appendChild(th);
        table.appendChild(row1);
    
        var row2 = document.createElement('tr');
        var td1 = document.createElement('td');
        // Gearbox table here
        var boxT = buildGearBox(input);
        td1.appendChild(boxT);
        row2.appendChild(td1);
    
        var td2 = document.createElement('td');
        td2.style.verticalAlign = 'top';
        var ul = document.createElement('ul');
        
        Object.values(slots).forEach(function(slotName,index) {
          var itemName = input[slotName];
          
          if (itemName) {
            var li = document.createElement('li');
            
            var encName = encodeURIComponent(itemName.trim().replace(' ', '_'));

            // Put images inside an anchor tag with link to bg wiki
            var anchor = document.createElement('a');
            anchor.href = `https://bg-wiki.com/ffxi/${encName}`;
            anchor.target = '_blank';
            anchor.innerText = itemName;
            anchor.style.color = 'unset';
            anchor.style['text-decoration'] = 'none';

            li.appendChild(anchor);
            ul.appendChild(li);
          }
        });
        
        td2.appendChild(ul);
        row2.appendChild(td2);
        table.appendChild(row2);
    
        if (input.notes) {
          var row3 = document.createElement('tr');
          var tdNotes = document.createElement('td');
          tdNotes.textContent = input.notes;
          row3.appendChild(tdNotes);
          table.appendChild(row3);
        }
    
        el.appendChild(table);
      });
    })
  })
});