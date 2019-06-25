# auto-aura
Automatically enables auras (crit & mana) when playing mystic.

# Dependencies
This modules requires the modules battleNotify (https://github.com/tera-toolbox-mods/battle-notify). You can install it from the "get more mods" tab on tera toolbox. It needs to be precidely in a  "battle-notify" folder, not "battle-notify-master" or anything else.

More precisely, only the file lib/abnormal.js is needed.

# Commands
- `!autoaura` to toggle module (default: ON)
- `!autoaura onrez` to toggle automated recast of auras on rez (warning: it causes undesirable animation lock on rez, use at your own risk) (default: OFF)
