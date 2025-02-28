import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./Card";
import Button from "./Button";

const EventSummary = ({
  event = {
    id: "",
    title: "",
    date: "",
    description: "",
    location: "",
    image: "",
    totalContributions: 0,
    targetAmount: 0,
    gifts: [],
  },
  onViewDetails,
  onContribute,
}) => {
  // Calculate progress percentage
  const progressPercentage =
    event.targetAmount > 0
      ? Math.min(
          Math.round((event.totalContributions / event.targetAmount) * 100),
          100
        )
      : 0;

  // Format date
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date TBD";

  return (
    <Card className="h-full flex flex-col">
      <div className="relative pt-[56.25%] overflow-hidden">
        <img
          src={event.image || "/api/placeholder/400/225"}
          alt={event.title}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>

      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <div className="text-sm text-gray-500 mt-1">
          {formattedDate} • {event.location}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {event.description}
        </p>

        {event.targetAmount > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Contributions</span>
              <span className="font-medium">
                KSh {event.totalContributions.toLocaleString()} of KSh{" "}
                {event.targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {progressPercentage}% funded
            </div>
          </div>
        )}

        {event.gifts && event.gifts.length > 0 && (
          <div className="mt-4">
            <div className="font-medium text-sm mb-2">Gift Wishlist</div>
            <div className="flex -space-x-2 overflow-hidden">
              {event.gifts.slice(0, 5).map((gift, index) => (
                <div
                  key={gift.id || index}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200"
                >
                  {gift.image ? (
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                      Gift
                    </div>
                  )}
                </div>
              ))}
              {event.gifts.length > 5 && (
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                  +{event.gifts.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onViewDetails && onViewDetails(event)}
          className="flex-1"
        >
          View Details
        </Button>
        <Button
          variant="primary"
          onClick={() => onContribute && onContribute(event)}
          className="flex-1"
        >
          Contribute
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventSummary;
