# JavaScript-TamperMonkey
**Summary:** This tampermonkey script runs on a website and adds multiple features to the website:  
1-Metrics display  
2-Sort button  
3-Sort dropdown list

**Details**  
1-The following metrics are displayed for each route once the website loads: Stops Completed %, Shift Completed %, DPPH, OODT Stops  
>Stops Completed % is Percent of route that is finished by the driver
>
>
>Shift completed % is calculated by subtracting 10 hour work day from (current time- clock in time to work)
>
> 
>DPPH is the delivery rate or how many stops/hr driver is delivering
>
>
>Out Of Drive Time(OODT) Stops is how many stops the driver is going to bring back to station (undelivered stops) based on time left in the 10hr shift. DPPH and >time left in shift is used to project/calculate this number  


2-Sort Button sorts all the routes in ascending or descending order based on what the user selects in the sort dropdown list

3-Sort dropdown list let user sort the routes based on Stops Completed, Shift Completed, DPPH, and OODT Stops  


**Problems Accounted For While Working on the Project:**  
1- Site navigation-  
>Metrics were being displayed on the route detail page after a user clicked on a route. Script should only run on the home page
>
>
>When a user returned to home page from route detail page, sort button, dropdown list, and metrics would not reappend
>
>
>When a user filters the routes based on other filters already present on the webpage, metrics would not reappend
>
>
>When a user used the search bar to search by driver name or route number, metrics would not reappend

2-Dynamic Metrics Update  
>Stops Completed %, Shift Completed %, DPPH, OODT Stops needs to be updated once the stops completed data on the website refreshes for each route

3-Remove the default Sort dropdownlist thats already present on the website and replace it with my own in 2 instances:  
>When the website initially loads
>
>
>when the user returns to the homepage

