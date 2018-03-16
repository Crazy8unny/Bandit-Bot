var menuOpen = false;

$(document).ready(function()
{
    $(".navigation-icon").click(function()
    {
        if (!menuOpen)
        {
            $(".navigation").animate({
                  left: 0,
                  opacity: 1
              }, 1000, "linear");

            $(this).animate({
                  left: $(".navigation").width() + 15
              }, 1000, "linear");
          
            menuOpen = true;
        }
        else
        {
            $(".navigation").animate({
                  left: -$(".navigation").width(),
                  opacity: 0
              }, 1000, "linear");

            $(this).animate({
                  left: 15
              }, 1000, "linear");
          
            menuOpen = false;
        }
    });
});