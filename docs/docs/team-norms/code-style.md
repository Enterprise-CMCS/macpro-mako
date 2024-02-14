---
layout: default
title: Code Style Cheatsheet
parent: Team Norms
nav_order: 2
---

# Code Style

### What is it?

A set of rules or guidelines used when writing the source code for a computer program.

### Why is it?

It keeps the code looking neat and tidy, so anyone on the team can jump in and not
get lost in a jungle of curly braces and indentation levels. It's like everyone speaking 
the same slang in a super cool secret club. Plus, it saves time from arguing over trivial
stuff, like whether tabs are better than spaces, so there's more time for the fun 
stuff—coding and creating!

# OneMAC Style Norms

## Cheatsheet

TL;DR? No worries, here's a cheatsheet of the concepts outlined below:

- [DO NOT destructure](#object-access) so we maintain object context for methods and properties used in code

### Object Access

When integrating with complex objects, consider maintaining the object's integrity rather
than opting for destructuring. This approach ensures that the object's context is 
preserved, enhancing readability and maintainability.

#### Nomenclature simplification

For instance, rather than breaking
down the object into individual variables, which can lead to verbose and confusing naming
conventions, maintain the object as a whole.

```typescript jsx
const {
    setModalOpen,
    setContent: setModalContent,
    setOnAccept: setModalOnAccept,
} = useModalContext();
const {
    setContent: setBannerContent,
    setBannerShow,
    setBannerDisplayOn,
} = useAlertContext();
  
// vs

const modal = useModalContext();
const alert = useAlertContext();
```

#### Usage implication

This method simplifies reference to its properties and methods, providing a clearer and 
more direct understanding of its usage within the code. This strategy is particularly 
beneficial in scenarios where the object's structure and context significantly contribute
to its functionality and meaning in the application.

```typescript jsx
<form
  onSubmit={form.handleSubmit(async (data) => {
    try {
      await submit({
        //...
      });
      alert.setContent({
        header: "RAI response submitted",
        body: `The RAI response for ${item._source.id} has been submitted.`,
      });
      alert.setBannerShow(true);
      alert.setBannerDisplayOn("/dashboard");
      navigate({ path: "/dashboard" });
    } catch (e) {
      //...
    }
  })}
>
```