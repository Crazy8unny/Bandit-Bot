let definition = args[0];
if (!definition) return "You need to specify a word to look up!";
if (definition.trim().toLowerCase() === 'furvux') message.channel.send(`Clearly the best developer in the world!`);
else if (definition.trim().toLowerCase() === 'sheikh1365') message.channel.send(`A kind hearted person!`);
else if (definition.trim().toLowerCase() === 'keen') message.channel.send(`Keenly Clever!`);
else if (definition.trim().toLowerCase() === 'glassykiller') message.channel.send(`Your Father.`);

ud.term(definition, function(error, entries, tags, sounds)
{
    if (error)
    {
        console.error(error)
        message.channel.send(`Couldn't find this word.`)
    }
    else
    {
        message.channel.send(`Word : **${args[0]}**\n
Definition : **${entries[0].definition}**\n
Example : **${entries[0].example}**`)
    }
});