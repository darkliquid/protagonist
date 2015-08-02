# protagonist

Protagonist is a simple script to extract all of the works you have created on
protagonise.com into markdown files.

Each page is saved separately in a folder structure matching the URL it is on,
accompanied by an additional metadata.json file with such information as the
page title, story title, tags and other things.

## Usage

The protagonist binary takes a single parameter - the username of the user whose work you want to backup. For example:

`protagonist darkliquid`

This will create a new folder in the current directory named `darkliquid` which will contain all the works.

## Caveats

Due to the way protagonist works, it can not access unpublished, hidden or draft pages on protagonise, so you will need to either publish them or manually back them up. Also while protagonist tries it's best to convert things to pure markdown, sometimes HTML is still left inside the markdown files.
