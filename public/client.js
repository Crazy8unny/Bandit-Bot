var menuOpen = false;
var animationSpeed = 200;

$(document).ready(function()
{
    $(".navigation-icon").click(function()
    {
        if (!menuOpen)
        {
            $(".navigation").animate({
                  left: 0,
                  opacity: 1
              }, animationSpeed, "linear");

            $(this).animate({
                  left: $(".navigation").width() + 15
              }, animationSpeed, "linear");
          
            menuOpen = true;
        }
        else
        {
            $(".navigation").animate({
                  left: -$(".navigation").width(),
                  opacity: 0
              }, animationSpeed, "linear");

            $(this).animate({
                  left: 15
              }, animationSpeed, "linear");
          
            menuOpen = false;
        }
    });
});