---
layout: default
title: Webforms
nav_order: 8
---

# Webforms
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

- TOC
{:toc}

<br/>
### [ClICK HERE]({{ site.url }}{{ site.repo.name }}/metrics/webforms) to view documentation for individual webforms for the {{ site.repo.name }} project.
{: .no_toc  }
<br/>


## Purpose of this view
The goal of the webforms view is to be able to view all possible form fields as they relate to the data collected. We try to associate the "name" of the field, which is the key of the data as it is collected and stored, to the prompt and label of the question the user is presented with. 

## What are onemac webforms
These webforms are a replacement for the pdf form uploads previously used in mmdl, etc. These are dynamicly generated forms from a single document that represent the shape of a form and version. There three pieces to this puzzle. 
1. The form schema itself. this is the shape of a form that is delivered by the /forms endpoint to the frontend ui.
1. The form genereator. This is a collection of ui react components and `react-hook-form` methods that generate the ui from the form schema and render and validate the form presented to the user.
1. The data. The data collected is added along with its metadata to its parent record. This data can be used to view/approve/edit the form later by admins or other users with appropriate permissions. 

## Things to note
Some of the fields listed in these webforms are FieldGroups and FieldArrays. This means that they are arrays of values that contain groups of like values (think an array of identicaly typed objects). The items within those arrays will have `Parent` values to indicate which parent they belong to.


