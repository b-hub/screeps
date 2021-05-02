---
description: My experience setting up the screeps-grafana project
---

# screeps-grafana

One of the projects listed on the screeps third-party services page is [screeps-grafana](https://github.com/screepers/screeps-grafana). This is my experience getting a working dashboard showing stats collected from my screeps account.

## Initial setup - Docker

Following the steps listed for the self-hosted option, I downloaded the repository and got to work.

### Existing code - changed

screeps-grafana contains a coffee script which it uses to poll the screeps API and push the changed to Graphite \(more on that later\).

{% hint style="info" %}
Use of username/password instead of API token
{% endhint %}

Before running the project, you need to configure some environment variables found in the docker-compose.env file.

* SCREEPS\_USERNAME
* SCREEPS\_EMAIL
* SCREEPS\_PASSWORD
* SCREEPS\_SHARD

I did not want to use my username and password so I modified the coffee script and .env file to take an API token instead.

#### Old request

{% code title="ScreepsStatsd.coffee" %}
```coffeescript
    options =
      uri: 'https://screeps.com/api/user/memory'
      method: 'GET' 
      json: true
      resolveWithFullResponse: true
      headers:
        "X-Token": token
        "X-Username": token
      qs:
        path: 'stats'
        shard: process.env.SCREEPS_SHARD
```
{% endcode %}

#### New request

{% code title="ScreepsStatsd.coffee" %}
```coffeescript
    options =
      uri: 'https://screeps.com/api/user/memory'
      method: 'GET' 
      json: true
      resolveWithFullResponse: true
      qs:
        path: 'stats'
        shard: process.env.SCREEPS_SHARD
        _token: process.env.SCREEPS_TOKEN
```
{% endcode %}

As we no longer needed a login step to get the token, the script could be simplified further.

```coffeescript
run: ( string ) ->
  /* ... */

  loop: () =>
    @main()

  main:() =>
    if (succes)
      @getMemory()
      return

    @client = new StatsD host: process.env.GRAPHITE_PORT_8125_UDP_ADDR
    @getMemory()

  getMemory: () =>
    /* ... */

  report: (data, prefix="") =>
    /* ... */
```

### Running the docker container

The docker container ran fine and I was able to see the example dashboard. However, none of the graphs appeared to be working.

![](../../.gitbook/assets/brokendashboard.png)

Being new to this whole stack, I had no idea what was wrong.

### Fixing example dashboard

The project comes with the example dashboard 'sampleDashboard.json' and contains references to the metric 'screeps'. E.g. 'screeps.cpu.used'.

No such metric exists. In order to fix the dashboard I needed to replaced the term 'screeps' with 'stats.gauges'. Looking in the [StatsD](https://statsd.readthedocs.io/en/v3.1/types.html#gauges) documentation the following line sheds some light:

> The statsd server collects gauges under the stats.gauges prefix.

![](../../.gitbook/assets/image.png)

#### Unfortunate Insight

Straight away a metric stands out... 

![](../../.gitbook/assets/image%20%281%29.png)

... poor Steve is going to be there a while before he sees the GCL tick over to level 7.

