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
  img.style['width'] = '32px';
  img.style['height'] = '32px';

  if (name) {
    var map_entry = gearmap[name.toLowerCase()];
    if (map_entry) {
      img.src = `https://static.ffxiah.com/images/icon/${map_entry.id}.png`;
      img.title = name;
      
      var encName = encodeURIComponent(name.trim().replaceAll(' ', '_'));

      // Put images inside an anchor tag with link to bg wiki
      var anchor = document.createElement('a');
      anchor.href = `https://bg-wiki.com/ffxi/${encName}`;
      anchor.target = '_blank';
      anchor.appendChild(img);
      return anchor;
    } else {
      // Warn user about broken links
      var warning = document.createElement('div');
      warning.style['width'] = '32px';
      warning.style['height'] = '32px';
      warning.style['background-color'] = 'black';
      warning.innerHTML = `<svg viewBox="0 0 24 24" fill="yellow">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>`;
      warning.title = `Cannot find item: ${name}`;
      return warning;
    }
  } else {
    img.src = `https://static.ffxiah.com/images/eq${slotNum+1}.gif`
  }
  
  return img;
}

function buildGearBox(input) {
  var t = document.createElement('div');
  t.style['display'] = 'block';
  t.style['margin'] = '0';
  t.style['border'] = 'none';
  t.style['width'] = '132px';
  var tds = [];
  var trs = [];

  trs[0] = document.createElement('div');
  trs[1] = document.createElement('div');
  trs[2] = document.createElement('div');
  trs[3] = document.createElement('div');

  Object.keys(slots).forEach(function(key,index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object
    var slotName = slots[key];
    tds[key] = document.createElement('div');
    tds[key].style['width'] = '32px';
    tds[key].style['height'] = '32px';
    tds[key].style['padding'] = '0';
    tds[key].style['float'] = 'left';
    tds[key].style['border'] = 'none';
    tds[key].style['margin-bottom'] = '1px';
    tds[key].style['margin-right'] = '1px';
    tds[key].style['background-image'] = 'url(https://static.ffxiah.com/images/equip_box.gif)';
    tds[key].style['position'] = 'relative';

    tds[key].appendChild(getImg(index, input[slotName]));

    // Add augment icon if augment defined
    var augDesc = input[slotName + 'Aug'];
    if (augDesc) {
      var aug = document.createElement('img');
      aug.title = augDesc;
      aug.src = 'https://www.bg-wiki.com/images/thumb/8/87/Augment-Icon.png/15px-Augment-Icon.png';
      aug.style['position'] = 'absolute';
      aug.style['top'] = '0';
      aug.style['right'] = '0';
      tds[key].appendChild(aug);
    }

    trs[Math.floor(key/4)].appendChild(tds[key]);
  });

  for (var tr of trs) {
    t.appendChild(tr);
  }

  return t;
}

function rando() {
  return Math.floor(Math.random() * 10000000) + 1;
}

// Toggle the visibility of the element with the provided id
function toggleDisplay(id) {
  var el = document.getElementById(id);
  el.style.display = el.style.display == 'none' ? 'inline-block' : 'none';
}

function copyItems(input) {
  var copyStr = '';
  // Add multiline comment with title and notes
  if (input.title || input.notes) {
    copyStr += `--[[\n${input.title ? '  ' + input.title + '\n' : ''}${input.notes ? '  ' + input.notes + '\n' : ''}]]\n`;
  }
  copyStr += 'sets.PlaceholderSetName = {'
  Object.values(slots).forEach((slotName, index) => {
    var itemName = input[slotName];
    var aug = input[slotName + 'Aug'];
    if (itemName) {
      copyStr += `\n  ${slotName}="${itemName}",`;
      // If has augments, add them as an inline comment
      if (aug) {
        copyStr += ` -- ${aug}`;
      }
    }
  });
  copyStr += '\n}\n';
  
  navigator.clipboard.writeText(copyStr);
}

// Wait for contents to exist
waitForElm('.contents').then((elm) => {
  fetch('/items.1675850181.json').then(response => {
    response.json().then(response_value => {
      gearmap = response_value;
      document.querySelectorAll('.gearset').forEach(function(el) {
        var gearsetId = rando();
        var input = {
          title: el.getAttribute('data-title'),
          notes: el.getAttribute('data-notes'),
          main: el.getAttribute('data-main'),
          mainAug: el.getAttribute('data-main-aug'),
          sub: el.getAttribute('data-sub'),
          subAug: el.getAttribute('data-sub-aug'),
          range: el.getAttribute('data-range') || el.getAttribute('data-ranged'),
          rangeAug: el.getAttribute('data-range-aug') || el.getAttribute('data-ranged-aug'),
          ammo: el.getAttribute('data-ammo'),
          ammoAug: el.getAttribute('data-ammo-aug'),
          head: el.getAttribute('data-head'),
          headAug: el.getAttribute('data-head-aug'),
          body: el.getAttribute('data-body'),
          bodyAug: el.getAttribute('data-body-aug'),
          hands: el.getAttribute('data-hands'),
          handsAug: el.getAttribute('data-hands-aug'),
          legs: el.getAttribute('data-legs'),
          legsAug: el.getAttribute('data-legs-aug'),
          feet: el.getAttribute('data-feet'),
          feetAug: el.getAttribute('data-feet-aug'),
          neck: el.getAttribute('data-neck'),
          neckAug: el.getAttribute('data-neck-aug'),
          waist: el.getAttribute('data-waist'),
          waistAug: el.getAttribute('data-waist-aug'),
          ear1: el.getAttribute('data-ear1') || el.getAttribute('data-left-ear'),
          ear1Aug: el.getAttribute('data-ear1-aug') || el.getAttribute('data-left-ear-aug'),
          ear2: el.getAttribute('data-ear2') || el.getAttribute('data-right-ear'),
          ear2Aug: el.getAttribute('data-ear2-aug') || el.getAttribute('data-right-ear-aug'),
          ring1: el.getAttribute('data-ring1') || el.getAttribute('data-left-ring'),
          ring1Aug: el.getAttribute('data-ring1-aug') || el.getAttribute('data-left-ring-aug'),
          ring2: el.getAttribute('data-ring2') || el.getAttribute('data-right-ring'),
          ring2Aug: el.getAttribute('data-ring2-aug') || el.getAttribute('data-right-ring-aug'),
          back: el.getAttribute('data-back'),
          backAug: el.getAttribute('data-back-aug'),
        }
        
        var hasAugs = false;
        Object.values(slots).forEach((slotName) => {
          if (input[slotName + 'Aug']) {
            hasAugs = true;
          }
        });

        var table = document.createElement('div');
        table.style['border'] = '1px solid #9e9e9e';
        table.style['border-radius'] = '4px';
        table.style['max-width'] = '354px';
        var row1 = document.createElement('div');
        var th = document.createElement('div');
        th.style['display'] = 'flex';
        th.style['align-items'] = 'center';
        th.style['background-color'] = '#0d0d0d';
        th.style['padding'] = '10px';
        th.style['border-radius'] = '4px 4px 0px 0px';
        
        if (hasAugs) {
          var augListToggle = document.createElement('button');
          augListToggle.addEventListener('click', () => toggleDisplay(gearsetId));
          augListToggle.style['width'] = '20px';
          augListToggle.style['height'] = '20px';
          augListToggle.innerHTML = `<svg viewBox="0 0 100 80" width="100%" height="100%" fill="#9e9e9e">
            <rect x="10" y="7" width="80" height="6"></rect>
            <rect x="10" y="37" width="80" height="6"></rect>
            <rect x="10" y="67" width="80" height="6"></rect>
          </svg>`;
          th.appendChild(augListToggle);
        }

        var titleSpan = document.createElement('span');
        titleSpan.style['flex-grow'] = '1';
        titleSpan.style['font-size'] = '1.1rem';
        titleSpan.style['text-align'] = 'center';
        titleSpan.style['padding'] = '0 5px';
        titleSpan.textContent = input.title;
        th.appendChild(titleSpan);

        var copyBtn = document.createElement('button');
        copyBtn.addEventListener('click', () => copyItems(input));
        copyBtn.style['width'] = '20px';
        copyBtn.style['height'] = '20px';
        copyBtn.innerHTML = `<svg viewBox="0 0 115.77 122.88" fill="#9e9e9e" style="enable-background:new 0 0 115.77 122.88" xml:space="preserve">
          <style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style>
          <g>
            <path class="st0" d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02
            v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02
            c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7
            h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02
            c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01
            c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65
            v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z
            M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01
            c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02
            v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"/>
          </g>
        </svg>`;
        th.appendChild(copyBtn);

        row1.appendChild(th);
        table.appendChild(row1);
    
        var row2 = document.createElement('div');
        row2.style['display'] = 'flex';
        row2.style['justify-content'] = 'center';

        var td1 = document.createElement('div');
        td1.style['display'] = 'inline-block';
        td1.style['padding'] = '10px';
        // Gearbox table here
        var boxT = buildGearBox(input);
        td1.appendChild(boxT);
        row2.appendChild(td1);
    
        if (hasAugs) {
          var td2 = document.createElement('div');
          td2.style['max-width'] = '200px';
          td2.style['flex-grow'] = '1';
          td2.style['padding'] = '0 10px 10px 0';
          td2.id = gearsetId;
          td2.style['display'] = el.classList.contains('collapse') ? 'none' : 'inline-block';
          
          var augLabel = document.createElement('div');
          augLabel.style['font-size'] = '0.8rem';
          augLabel.style['color'] = '#9e9e9e';
          augLabel.style['text-decoration'] = 'underline';
          augLabel.textContent = 'Augments';
          td2.appendChild(augLabel);
        
          // List any items that have defined augments
          Object.values(slots).forEach((slotName) => {
            var itemName = input[slotName];
            var augDesc = input[slotName + 'Aug'];
            
            if (itemName && augDesc) {
              // Put images inside an anchor tag with link to bg wiki
              var encName = encodeURIComponent(itemName.trim().replaceAll(' ', '_'));
              var anchor = document.createElement('a');
              anchor.href = `https://bg-wiki.com/ffxi/${encName}`;
              anchor.target = '_blank';
              anchor.style['color'] = 'unset';
              anchor.style['text-decoration'] = 'none';

              var anchorContent = document.createElement('div');
              anchorContent.style['background-color'] = '#212121';
              anchorContent.style['border'] = '1px solid #424242';
              anchorContent.style['padding'] = '0 5px';
              anchorContent.style['border-radius'] = '3px';
              anchorContent.style['margin-top'] = '4px';
              
              var nameDiv = document.createElement('div');
              nameDiv.style['font-size'] = '0.8rem';
              nameDiv.style['color'] = '#9e9e9e';
              nameDiv.textContent = itemName;
              anchorContent.appendChild(nameDiv);

              var augDiv = document.createElement('div');
              augDiv.style['font-size'] = '0.8rem';
              augDiv.textContent = augDesc;
              anchorContent.appendChild(augDiv);

              anchor.appendChild(anchorContent);
              td2.appendChild(anchor);
            }
          });
          
          row2.appendChild(td2);
        }
        table.appendChild(row2);
    
        if (input.notes) {
          var row3 = document.createElement('div');
          var tdNotes = document.createElement('div');
          tdNotes.style['padding'] = '10px';
          tdNotes.style['border-top'] = '1px solid #9e9e9e';
          tdNotes.textContent = input.notes;
          row3.appendChild(tdNotes);
          table.appendChild(row3);
        }
    
        el.appendChild(table);
      });
    })
  })
});