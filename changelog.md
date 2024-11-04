# Changelog

# 0.6.1
 - Fix manifest URL for context menu library

# 0.6.0
 - Upgrade compatible core version to V12
 - Set maximum compatible core version to V12
 - Fix bug displaying context menu option in V12 [[#14]]

# 0.5.0
 - Switch to using new `getCompendiumEntryContext` hook if using v10
 - Switch to single-file javascript release to avoid unnecessary downloads
 - Adjust patching to use libWrapper if available
 - Remove obsolete compatibility shims for [Quick Rolls to Chat](https://github.com/itamarcu/roll-from-compendium) & [Monk's Little Details](https://github.com/ironmonk88/monks-little-details) 
 - Upgrade compatible core version to v10
 - Drop support for 0.7 & 0.8

# 0.4.4
 - Add Korean translation (thanks [drdwing](https://github.com/drdwing))
 - Upgrade compatible core version to v9

# 0.4.3
 - Upgrade compatible core version to 0.8.6

# 0.4.2
 - Update Module Management hooks to work with new version of [Context Menu Library](https://github.com/arbron/fvtt-context-menu-library)

# 0.4.1
 - Add support for 0.8.0

# 0.4.0
 - Switch to external library for adding context menus to resolve compatibility issues with other modules that also modify compendium context menus
 - Fix compatibility issue with [Monk's Little Details](https://github.com/ironmonk88/monks-little-details) module (thanks DivertedCircle)

# 0.3.1
 - Add Ko-fi account into manifest
 - Update module manifest viewer to support Manifest+ version 1.1.0
 - Add message if players attempt to update compendium when no GM user is active
 - Fix bug causing multiple updates to be issued if multiple GM users are active

# 0.3.0
 - Add compendium edit permissions to allow non-GM users to modify compendia

# 0.2.3
 - Opt-in to [Bug Reporter](https://github.com/League-of-Foundry-Developers/bug-reporter)

# 0.2.2
 - Fix compatibility issue with the [Roll From Compendium](https://github.com/itamarcu/roll-from-compendium) module (thanks DivertedCircle#9718)

# 0.2.1
 - Add deprecation description to module manifests

# 0.2.0
 - Add tool to view module manifests

# 0.1.1
 - Add error if replacement cannot be stored in Compendium

# 0.1.0
 - Initial public release
